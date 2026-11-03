# Five designs, one app (picker bottom-left, ?d=ticket|trip|split|name|barebone)

- ticket: the page is a printed ticket with DO left blank; split-flap destination follows you to the final ticket (Magic UI marquee/number ticker, React Bits split flap/circular text/scroll expand, hand-built tilt card).
- trip: a day on the road. A fixed clock runs 6:00 to 23:30 as you scroll while flat colour blocks go from morning sand to night.
- split: a flat drawing of the van. The roof, door, rear and front turn teal as you read about them; tabs and clicks jump between parts.
- name: WENDROWAN set huge in a variable font (React Bits VariableProximity); weight follows the cursor, idle wave on touch. Yellow and black.
- barebone: plain logbook. Expanded Archivo headline, four entries, a real price table, cobalt buttons.

Photos carry little weight in all five: small cropped frames, never the whole idea. Swap them in src/lib/content.ts and each design file.
Known: fixed UI (picker, clock, ticket stub) trips the inspector's covered-text rule; that is expected.
