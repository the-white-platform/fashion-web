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

    payload.logger.info(`  → Found ${provinces.length} provinces.`)

    for (const p of provinces) {
      let provinceDoc: any
      const existingProvince = await payload.find({
        collection: 'provinces',
        where: { code: { equals: String(p.code) } },
        limit: 1,
      })

      if (existingProvince.totalDocs > 0) {
        provinceDoc = existingProvince.docs[0]
      } else {
        provinceDoc = await payload.create({
          collection: 'provinces',
          data: {
            name: p.name,
            code: String(p.code),
          },
        })
      }

      if (p.districts) {
        for (const d of p.districts) {
          let districtDoc: any
          const existingDistrict = await payload.find({
            collection: 'districts',
            where: { code: { equals: String(d.code) } },
            limit: 1,
          })

          if (existingDistrict.totalDocs > 0) {
            districtDoc = existingDistrict.docs[0]
          } else {
            districtDoc = await payload.create({
              collection: 'districts',
              data: {
                name: d.name,
                code: String(d.code),
                province: provinceDoc.id as any,
              },
            })
          }

          if (d.wards && d.wards.length > 0) {
            const existingWards = await payload.find({
              collection: 'wards',
              where: { district: { equals: districtDoc.id } },
              limit: 1000,
            })
            const existingWardCodes = new Set(existingWards.docs.map((w: any) => String(w.code)))
            const newWards = d.wards.filter((w: any) => !existingWardCodes.has(String(w.code)))

            if (newWards.length > 0) {
              const BATCH_SIZE = 50
              for (let i = 0; i < newWards.length; i += BATCH_SIZE) {
                const batch = newWards.slice(i, i + BATCH_SIZE)
                await Promise.all(
                  batch.map((w: any) =>
                    payload.create({
                      collection: 'wards',
                      data: {
                        name: w.name,
                        code: String(w.code),
                        district: districtDoc.id as any,
                      },
                    }),
                  ),
                )
              }
            }
          }
        }
      }
      payload.logger.info(`  ✓ Synchronized ${p.name}`)
    }

    payload.logger.info('  ✓ Vietnam address data seeding completed!')
  } catch (error: any) {
    payload.logger.error(`  ✗ Failed to seed Vietnam addresses: ${error.message}`)
  }
}
