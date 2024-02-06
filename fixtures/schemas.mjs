import { z } from 'zod'

export const car_manufacturer = z
  .literal('Ferrari')
  .or(z.literal('Ford'))
  .or(z.literal('Ford'))
  .or(z.literal('Honda'))
  .or(z.literal('Peugeot'))
  .or(z.literal('Toyota'))
  .or(z.literal('Volkswagen'))
  .describe('Car manufacturer')

export const motorcycle_manufacturer = z
  .literal('Aprilia')
  .or(z.literal('BMW'))
  .or(z.literal('Ducati'))
  .or(z.literal('Harley Davidson'))
  .or(z.literal('Honda'))
  .or(z.literal('Kawasaki'))
  .or(z.literal('KTM'))
  .or(z.literal('Royal Enfield'))
  .or(z.literal('Suzuki'))
  .or(z.literal('SWM'))
  .or(z.literal('Triumph'))
  .or(z.literal('Yamaha'))
  .describe('Motorcycle manufacturer')

export const car_model = z.string().min(1).describe('Car model')

export const motorcycle_model = z.string().min(1).describe('Motorcycle model')

export const year = z.number().min(1900).max(2024)

export const car_tire_pressure = z
  .number()
  .min(28)
  .max(42)
  .describe('Car tire pressure in PSI')

export const motorcycle_tire_pressure = z
  .number()
  .min(28)
  .max(42)
  .describe('Motorcycle tire pressure in PSI')

export const car_tire_manufacturer = z
  .literal('Bridgestone')
  .or(z.literal('Continental'))
  .or(z.literal('Goodyear'))
  .or(z.literal('Michelin'))
  .or(z.literal('Pirelli'))
  .or(z.literal('Yokohama'))
  .describe('Car tire manufacturer')

export const motorcycle_tire_manufacturer = z
  .literal('Bridgestone')
  .or(z.literal('Continental'))
  .or(z.literal('Goodyear'))
  .or(z.literal('Michelin'))
  .or(z.literal('Pirelli'))
  .or(z.literal('Yokohama'))
  .describe('Motorcycle tire manufacturer')

export const car_tire = z.object({
  manufacturer: car_tire_manufacturer,
  pressure: car_tire_pressure.default(30)
})

export const motorcycle_tire = z.object({
  manufacturer: motorcycle_tire_manufacturer,
  pressure: motorcycle_tire_pressure.default(32)
})

export const car = z.object({
  manufacturer: car_manufacturer,
  model: car_model,
  tires: z.array(car_tire).length(4),
  year: year.describe('Year in which the car was manufactured')
})

export const motorcycle = z.object({
  manufacturer: motorcycle_manufacturer,
  model: motorcycle_model,
  tires: z.array(motorcycle_tire).length(2),
  year: year.describe('Year in which the motorcycle was manufactured')
})

export const person_name = z.string().min(1).describe('Name of the person')

export const job_title = z.string().min(1).describe('Job title')

export const JOBS = ['mechanic', 'salesman']

export const employee = z
  .object({
    job_title: job_title.refine((title) => JOBS.includes(title), {
      message: `job_title must be one of: ${JOBS.join(' ')}`
    }),
    name: person_name.describe('Name of the employee')
  })
  .describe('Employee')

export const business_owner = z.object({
  name: person_name.describe('Name of the business owner')
})

export const dealership = z.object({
  owner: business_owner.describe('Owner of the dealership'),
  employees: z.array(employee).min(1).describe('Employees of the dealership'),
  cars: z.array(car).default([]).describe('Cars sold by the dealership'),
  motorcycles: z
    .array(motorcycle)
    .default([])
    .describe('Motorcycles sold by the dealership')
})
