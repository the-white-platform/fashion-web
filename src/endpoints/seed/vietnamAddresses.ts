import type { Payload } from 'payload'
import fs from 'fs'
import path from 'path'

export const seedVietnamAddresses = async (payload: Payload): Promise<void> => {
  payload.logger.info('— Seeding Vietnam administrative data (Provinces, Districts, Wards)...')

  const filePath = path.join(process.cwd(), 'src/data/vn-data.json')

  if (!fs.existsSync(filePath)) {
    payload.logger.error('  ✗ Vietnam data file not found at src/data/vn-data.json')
    return
  }

  try {
    const rawData = fs.readFileSync(filePath, 'utf8')
    const provinces = JSON.parse(rawData)

    payload.logger.info(`  → Found ${provinces.length} provinces in source data.`)

    const provinceCount = await payload.count({ collection: 'provinces' })
    // Fast-path: if the provinces table already has the full set, don't
    // re-walk every district/ward. On a remote DB the per-record existence
    // checks take many minutes; if the data is already there we can skip.
    if (provinceCount.totalDocs >= provinces.length) {
      payload.logger.info(
        `  → DB already has ${provinceCount.totalDocs} provinces (>= ${provinces.length} expected). Skipping address sync.`,
      )
      return
    }

    // Fresh-seed mode: empty table → skip the per-record existence checks.
    const freshSeed = provinceCount.totalDocs === 0
    payload.logger.info(
      freshSeed
        ? '  → DB has 0 provinces — fresh-seed mode (skipping existence checks).'
        : `  → DB has ${provinceCount.totalDocs} provinces (partial) — upsert mode.`,
    )

    let totalDistricts = 0
    let totalWards = 0
    const tAll = Date.now()

    for (let pi = 0; pi < provinces.length; pi++) {
      const p = provinces[pi]
      const provinceLabel = `[${pi + 1}/${provinces.length}] ${p.name}`
      const tProv = Date.now()

      let provinceDoc: any
      if (freshSeed) {
        provinceDoc = await payload.create({
          collection: 'provinces',
          data: { name: p.name, code: String(p.code) },
        })
      } else {
        const existingProvince = await payload.find({
          collection: 'provinces',
          where: { code: { equals: String(p.code) } },
          limit: 1,
        })
        provinceDoc =
          existingProvince.totalDocs > 0
            ? existingProvince.docs[0]
            : await payload.create({
                collection: 'provinces',
                data: { name: p.name, code: String(p.code) },
              })
      }

      if (p.districts) {
        // Create districts in capped-concurrency batches so we don't blow
        // Supabase's session-mode pool (default ~25 clients).
        const POOL = 10
        const districtDocs: any[] = new Array(p.districts.length)
        for (let i = 0; i < p.districts.length; i += POOL) {
          const slice = p.districts.slice(i, i + POOL)
          const docs = await Promise.all(
            slice.map(async (d: any) => {
              if (freshSeed) {
                return payload.create({
                  collection: 'districts',
                  data: {
                    name: d.name,
                    code: String(d.code),
                    province: provinceDoc.id as any,
                  },
                })
              }
              const existingDistrict = await payload.find({
                collection: 'districts',
                where: { code: { equals: String(d.code) } },
                limit: 1,
              })
              return existingDistrict.totalDocs > 0
                ? existingDistrict.docs[0]
                : payload.create({
                    collection: 'districts',
                    data: {
                      name: d.name,
                      code: String(d.code),
                      province: provinceDoc.id as any,
                    },
                  })
            }),
          )
          docs.forEach((doc, k) => (districtDocs[i + k] = doc))
        }
        totalDistricts += districtDocs.length

        // Build a flat list of ward thunks (functions, NOT promises) so the
        // POOL throttle below actually limits concurrency. Pushing live
        // promises would have started everything immediately.
        type WardJob = () => Promise<any>
        const wardJobs: WardJob[] = []
        for (let di = 0; di < p.districts.length; di++) {
          const d = p.districts[di]
          if (!d.wards || d.wards.length === 0) continue
          const districtDoc = districtDocs[di]

          let newWards = d.wards
          if (!freshSeed) {
            const existingWards = await payload.find({
              collection: 'wards',
              where: { district: { equals: districtDoc.id } },
              limit: 1000,
            })
            const existingWardCodes = new Set(existingWards.docs.map((w: any) => String(w.code)))
            newWards = d.wards.filter((w: any) => !existingWardCodes.has(String(w.code)))
          }

          for (const w of newWards) {
            wardJobs.push(() =>
              payload.create({
                collection: 'wards',
                data: {
                  name: w.name,
                  code: String(w.code),
                  district: districtDoc.id as any,
                },
              }),
            )
          }
          totalWards += d.wards.length
        }

        for (let i = 0; i < wardJobs.length; i += POOL) {
          const slice = wardJobs.slice(i, i + POOL)
          await Promise.all(slice.map((fn) => fn()))
          if (i % (POOL * 5) === 0 && i > 0) {
            payload.logger.info(
              `     · wards: ${i + slice.length}/${wardJobs.length} (${provinceLabel})`,
            )
          }
        }
      }

      payload.logger.info(
        `  ✓ ${provinceLabel} (${Date.now() - tProv}ms; running totals: ${totalDistricts} districts, ${totalWards} wards, elapsed ${Math.round((Date.now() - tAll) / 1000)}s)`,
      )
    }

    payload.logger.info('  ✓ Vietnam address data seeding completed!')
  } catch (error: any) {
    payload.logger.error(`  ✗ Failed to seed Vietnam addresses: ${error.message}`)
  }
}
