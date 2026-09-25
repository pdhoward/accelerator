import { faqItems } from "@/content/faq";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FadeUp, FadeUpItem } from "@/components/motion/fade-up";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";

export function FaqAccordion() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <FadeUp className="mb-10 text-center">
        <FadeUpItem>
          <SectionEyebrow className="mx-auto justify-center">FAQ</SectionEyebrow>
        </FadeUpItem>
        <FadeUpItem>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            Questions worth answering up front
          </h2>
        </FadeUpItem>
      </FadeUp>

      <FadeUpItem>
        <Accordion type="single" collapsible>
          {faqItems.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </FadeUpItem>
    </section>
  );
}
