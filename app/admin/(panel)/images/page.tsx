import CopyButton from "@/components/CopyButton";
import { requireAdmin } from "@/lib/admin-auth";
import { SITE } from "@/lib/site";
import { allTrips } from "@/lib/trips-data";
import { canResize, getPicks, imageUrl, listImages, smallUrl, type UploadedImage } from "@/lib/uploads";
import { saveImageAltAction, saveImagePicksAction } from "../../actions";
import ImageUploader from "./ImageUploader";

export const metadata = { title: "الصور" };

function Thumb({ image }: { image: UploadedImage }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={smallUrl(image.name)} alt={image.alt} width={160} height={Math.round((160 * image.height) / image.width)} loading="lazy" />;
}

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { saved } = await searchParams;
  const [images, picks, resizeOk, trips] = await Promise.all([listImages(), getPicks(), canResize(), allTrips()]);

  return (
    <>
      <div className="admin-title">
        <h1>الصور</h1>
      </div>

      {!resizeOk && (
        <p className="notice">ضغط الصور مش شغال على السيرفر ده، فرفع الصور واقف. ابعت الرسالة دي للمبرمج.</p>
      )}

      <div className="admin-images-top">
        <ImageUploader />
        <div className="card">
          <h3>إزاي تستخدم الصور</h3>
          <ol>
            <li>ارفع الصور من هنا.</li>
            <li>تحت، اختار كل صورة هتظهر فين: صورة كل رحلة، وصور المعرض في صفحة الرحلات، وصور &quot;مين احنا&quot;.</li>
            <li>صورة عرض الطيران بتختارها من صفحة العرض نفسه.</li>
          </ol>
          <p className="muted small">لو ما اخترتش صور لمكان، الموقع بيفضل يعرض الصور الأصلية.</p>
        </div>
      </div>

      {images.length === 0 ? (
        <p className="muted">لسه مفيش صور مرفوعة.</p>
      ) : (
        <>
          <h2>مكان كل صورة</h2>
          {saved && (
            <p className="admin-saved" role="status">
              <strong>✓ اتحفظ.</strong>
            </p>
          )}
          <form action={saveImagePicksAction} className="admin-picks">
            <fieldset>
              <legend>صورة كل رحلة</legend>
              {trips.map((t) => (
                <label key={t.slug}>
                  {t.title}
                  <select name={`trip:${t.slug}`} defaultValue={picks.trips[t.slug] ?? ""}>
                    <option value="">الصورة الأصلية</option>
                    {images.map((i) => (
                      <option key={i.name} value={i.name}>
                        {i.alt || i.name.slice(0, 8)}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </fieldset>

            <fieldset>
              <legend>صور المعرض في صفحة الرحلات</legend>
              <div className="admin-image-grid">
                {images.map((i) => (
                  <label key={i.name} className="admin-image-pick">
                    <input type="checkbox" name="gallery" value={i.name} defaultChecked={picks.gallery.includes(i.name)} />
                    <Thumb image={i} />
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>صور &quot;مين احنا&quot;</legend>
              <div className="admin-image-grid">
                {images.map((i) => (
                  <label key={i.name} className="admin-image-pick">
                    <input type="checkbox" name="about" value={i.name} defaultChecked={picks.about.includes(i.name)} />
                    <Thumb image={i} />
                  </label>
                ))}
              </div>
            </fieldset>

            <button className="btn btn-gold" type="submit">
              احفظ أماكن الصور
            </button>
          </form>

          <h2>كل الصور</h2>
          <div className="admin-image-list">
            {images.map((i) => (
              <div key={i.name} className="card admin-image-item">
                <Thumb image={i} />
                <form action={saveImageAltAction}>
                  <input type="hidden" name="name" value={i.name} />
                  <label>
                    الوصف
                    <input name="alt" defaultValue={i.alt} maxLength={150} />
                  </label>
                  <div className="admin-row-actions">
                    <button className="btn btn-outline btn-sm" type="submit">
                      احفظ الوصف
                    </button>
                    <CopyButton text={`${SITE.url}${imageUrl(i.name)}`} />
                  </div>
                </form>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
