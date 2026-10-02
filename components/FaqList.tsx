import type { FaqGroup } from "@/lib/faq";

/** FAQ groups as open/close questions. Section pages hide the group title (`plain`). */
export default function FaqList({ groups, plain = false }: { groups: FaqGroup[]; plain?: boolean }) {
  return groups.map((group) => (
    <div key={group.title} className="faq-group">
      {!plain && <h2>{group.title}</h2>}
      {group.items.map((item) => (
        <details key={item.q} className="faq-item">
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  ));
}
