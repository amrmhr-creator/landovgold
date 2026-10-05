import Link from "next/link";

/** The strip on top of an admin preview: says it's a preview, and whether people can see it. */
export default function PreviewBar({ hidden, editHref, publicHref }: { hidden: boolean; editHref: string; publicHref: string }) {
  return (
    <div className="preview-bar" role="status">
      <div className="container preview-bar-inner">
        <strong>معاينة:</strong>{" "}
        {hidden ? "ده شكلها على الموقع. لسه مخفية، ومحدش شايفها غيرك." : "ده شكلها على الموقع، وهي ظاهرة للناس."}
        <span className="preview-bar-links">
          <Link href={editHref}>← رجوع للتعديل</Link>
          {!hidden && (
            <a href={publicHref} target="_blank">
              افتحها على الموقع ↗
            </a>
          )}
        </span>
      </div>
    </div>
  );
}
