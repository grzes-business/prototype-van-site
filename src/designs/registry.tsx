"use client"

import type { ComponentType } from "react"

import type { DayRange } from "@/lib/dates"

export type DesignProps = { booked: DayRange[] | null; demo: boolean }

export type DesignEntry = { id: string; label: string; note: string; Component: ComponentType<DesignProps> }
