"use client"

import { useMemo, useState, type BaseSyntheticEvent } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { DateRange as PickerRange } from "react-day-picker"
import { toast } from "sonner"

import { verifyInquiry } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BOOKING_RULES, blockedRanges, lastBookableDay, today } from "@/lib/booking-rules"
import {
  daysBetween,
  formatDay,
  isoDateFromLocal,
  localDateFromIso,
  type DayRange,
} from "@/lib/dates"
import { inquirySchema, type Inquiry, type InquiryInput } from "@/lib/inquiry-schema"
import { sendInquiryEmail, web3formsAccessKey } from "@/lib/web3forms"

const PEOPLE_OPTIONS = Array.from({ length: BOOKING_RULES.maxPeople }, (_, i) => String(i + 1))

const EMPTY_FORM: InquiryInput = {
  start: "",
  end: "",
  name: "",
  email: "",
  phone: "",
  people: "2",
  pets: false,
  message: "",
}

export function InquiryForm({ booked }: { booked: DayRange[] }) {
  const router = useRouter()
  const [sent, setSent] = useState(false)

  const now = today()
  const schema = useMemo(() => inquirySchema(booked, now), [booked, now])
  const form = useForm<InquiryInput, unknown, Inquiry>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_FORM,
    mode: "onTouched",
  })

  const start = useWatch({ control: form.control, name: "start" })
  const end = useWatch({ control: form.control, name: "end" })
  const nights = start && end ? daysBetween(start, end) : 0

  const toDayMatcher = (range: DayRange) => ({
    from: localDateFromIso(range.start),
    to: localDateFromIso(range.end),
  })
  const bookedDays = booked.map(toDayMatcher)
  const disabledDays = [
    { before: localDateFromIso(now) },
    { after: localDateFromIso(lastBookableDay(now)) },
    ...blockedRanges(booked).map(toDayMatcher),
  ]

  function selectRange(range: PickerRange | undefined) {
    const options = { shouldDirty: true, shouldValidate: form.formState.isSubmitted }
    const start = range?.from ? isoDateFromLocal(range.from) : ""
    const end = range?.to ? isoDateFromLocal(range.to) : ""
    form.setValue("start", start, options)
    // The first click selects a same-day range; treat that as "no return day yet".
    form.setValue("end", end === start ? "" : end, options)
  }

  async function onSubmit(values: Inquiry, event?: BaseSyntheticEvent) {
    const check = await verifyInquiry(values)
    if (!check.ok) {
      for (const [field, message] of Object.entries(check.fieldErrors ?? {})) {
        form.setError(field as keyof InquiryInput, { message })
      }
      toast.error(check.message)
      // Dates may have been booked since the page loaded; show the latest calendar.
      router.refresh()
      return
    }

    try {
      const botcheck = new FormData(event?.target as HTMLFormElement).has("botcheck")
      await sendInquiryEmail(values, botcheck)
      setSent(true)
      form.reset(EMPTY_FORM)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The message couldn't be sent.")
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border p-8">
        <h3 className="text-lg font-semibold">Thanks, your request is on its way!</h3>
        <p className="text-muted-foreground">
          We&apos;ll get back to you by email or phone to confirm the dates.
        </p>
        <Button variant="outline" onClick={() => setSent(false)}>
          Send another request
        </Button>
      </div>
    )
  }

  const dateError = form.formState.errors.start ?? form.formState.errors.end

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-10 lg:grid-cols-[auto_1fr]"
    >
      <div className="flex flex-col gap-4">
        <Calendar
          mode="range"
          numberOfMonths={2}
          weekStartsOn={1}
          showOutsideDays={false}
          startMonth={localDateFromIso(now)}
          endMonth={localDateFromIso(lastBookableDay(now))}
          selected={
            start
              ? { from: localDateFromIso(start), to: end ? localDateFromIso(end) : undefined }
              : undefined
          }
          onSelect={selectRange}
          disabled={disabledDays}
          excludeDisabled
          modifiers={{ booked: bookedDays }}
          modifiersClassNames={{
            booked: "rounded-(--cell-radius) bg-neutral-200/70 [&_button]:line-through",
          }}
          className="rounded-xl border p-3 [--cell-size:--spacing(9)]"
        />
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-neutral-200" /> Booked
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm border" /> Turnover day (unavailable)
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-primary" /> Your dates
          </li>
        </ul>
      </div>

      <FieldGroup>
        <Field data-invalid={!!dateError}>
          <FieldLabel>Your dates</FieldLabel>
          <p className="text-sm">
            {start ? formatDay(start) : "Pick a pickup day"}
            {" → "}
            {end ? formatDay(end) : "and a return day"}
            {nights > 0 && (
              <span className="text-muted-foreground">
                {" "}
                · {nights} {nights === 1 ? "night" : "nights"}
              </span>
            )}
          </p>
          <FieldDescription>
            Minimum {BOOKING_RULES.minNights} nights, up to {BOOKING_RULES.horizonMonths} months
            ahead.
          </FieldDescription>
          <FieldError errors={[dateError]} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input {...field} id="name" autoComplete="name" aria-invalid={fieldState.invalid} />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  {...field}
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            name="people"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="people">Number of people</FieldLabel>
                <Select
                  name={field.name}
                  value={String(field.value)}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger id="people" className="w-full" aria-invalid={fieldState.invalid}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PEOPLE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <Controller
          name="pets"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                id="pets"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <FieldLabel htmlFor="pets" className="font-normal">
                I&apos;m bringing a pet
              </FieldLabel>
            </Field>
          )}
        />

        <Controller
          name="message"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="message">Message (optional)</FieldLabel>
              <Textarea
                {...field}
                id="message"
                rows={4}
                placeholder="Where are you heading? Anything we should know?"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        {/* Honeypot for bots; Web3Forms drops submissions where it's checked. */}
        <input
          type="checkbox"
          name="botcheck"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden
        />

        <div className="flex flex-col items-start gap-2">
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Sending…" : "Send request"}
          </Button>
          {!web3formsAccessKey && (
            <p className="text-xs text-muted-foreground">
              Email isn&apos;t configured yet — set NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY.
            </p>
          )}
        </div>
      </FieldGroup>
    </form>
  )
}
