# Image prompts — the two home-page case-study shots

Generated imagery, to replace the two vendored stock files whose licence was
never on record. Generating them settles the provenance question: the files
are ours.

## Constraints these prompts are built around

Read from the code, not invented:

- **16:9.** `--case-shot-ratio: 16 / 9` with `object-fit: cover`. Generate at
  16:9 so nothing is cropped away. 2400x1350 or larger.
- **Rendered greyscale.** `--case-shot-filter: grayscale(1) contrast(1.05)`.
  The image must carry on tone and shape alone -- a composition that depends
  on colour separation collapses on the page.
- **No legible text in frame.** Signage, screen text and dashboard numerals
  would either garble or read as a claim we cannot support. Screens stay
  out of focus or out of frame.
- **Not documentary.** These illustrate a sector; they are not photographs of
  these engagements. No identifiable faces to camera, no fake company marks.
  The alt text says only what is in the frame.

## Shared style block

Prepend to both:

> Editorial documentary photograph, shot on a full-frame camera with a 35mm
> lens at f/4. Available light only, no flash, no colour grade. Restrained
> and observational -- the register of a broadsheet business section, not
> glossy corporate stock. Strong tonal separation between foreground,
> midground and background so the frame holds up in black and white. Deep
> depth in the composition, clean geometry, no lens flare, no vignette.
> 16:9, 2400x1350.

## Study 01 -- `nonprofit-web-platform`

Non-Profit. A global membership organisation in 180+ countries: courses,
enrolment, donations and member records, previously in three systems that
never agreed.

> A wide view of a training session in a plain, bright hall -- perhaps
> fifteen adults seated at long tables with open laptops, seen from the back
> of the room over their shoulders. A facilitator stands at the front beside
> a projection surface that is bright and blank, no legible text on it. Tall
> windows along one wall throw even daylight across the room. Ordinary
> institutional furniture, no branding anywhere. Faces are away from camera
> or in soft focus. The mood is working, not celebratory.

Why this frame: the platform's centre of gravity is courses and membership,
so the shot is people being taught, not a stock office. Shooting from the
back keeps every face unidentifiable and keeps the room -- the many-people,
many-places fact -- as the subject.

## Study 02 -- `enterprise-data-pipeline`

Manufacturing. CRM and ERP reporting 12 to 24 hours behind; a medallion
pipeline in Airflow brought end-to-end latency under fifteen minutes.

> A wide view down the length of a working plant floor. Steel pipework and a
> conveyor run away from the camera in strong linear perspective, converging
> toward the far end of the building. Overhead gantries and ducting above,
> painted floor markings below. Daylight from high clerestory windows mixes
> with industrial fixtures. One or two workers in plain hi-vis are small in
> the midground, back to camera, giving scale. No signage, no legible
> lettering on any machine, no company marks.

Why this frame: the receding line of pipework is the sector and the argument
in one image -- a pipeline in the literal sense, holding its shape in
greyscale on geometry alone.

## Negative prompt for both

> text, lettering, signage, logos, watermarks, numbers, charts, dashboards,
> UI screens, faces to camera, portrait close-up, smiling stock models,
> handshake, teal-and-orange grade, HDR, oversaturated, tilt-shift, bokeh
> balls, 3D render, illustration, CGI, plastic skin, extra fingers

## Placement, once generated

Convert to webp and drop in at these exact paths -- the markup is keyed on
the slug, so the files are the whole change:

    public/case-studies/nonprofit-web-platform.webp
    public/case-studies/enterprise-data-pipeline.webp

    cwebp -q 82 -resize 1600 0 <in>.png -o <out>.webp
