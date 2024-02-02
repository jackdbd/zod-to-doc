import { z } from 'zod'

export const car_manufacturer = z
  .literal('Ferrari')
  .or(z.literal('Ford'))
  .or(z.literal('Ford'))
  .or(z.literal('Peugeot'))
  .or(z.literal('Toyota'))
  .or(z.literal('Volkswagen'))
  .describe('Car manufacturer')

export const car_model = z.string().min(1).describe('Car model')

export const year = z.number().min(1900).max(2024)

export const car_tire_pressure = z
  .number()
  .min(28)
  .max(42)
  .describe('Car tire pressure in PSI')

export const car_tire_manufacturer = z
  .literal('Bridgestone')
  .or(z.literal('Continental'))
  .or(z.literal('Goodyear'))
  .or(z.literal('Michelin'))
  .or(z.literal('Pirelli'))
  .or(z.literal('Yokohama'))
  .describe('Car tire manufacturer')

export const car_tire = z.object({
  manufacturer: car_tire_manufacturer,
  pressure: car_tire_pressure.default(30)
})

export const car = z.object({
  manufacturer: car_manufacturer,
  model: car_model,
  tires: z.array(car_tire).length(4),
  year: year.describe('Year in which the car was manufactured')
})
