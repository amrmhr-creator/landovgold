// The starting trips (from CONTENT.md) and shared trip helpers. The owner edits trips from
// /admin/trips (lib/trips-data.ts); these are shown until his first save.

export type TripDay = { title: string; items: string[] };

export type Trip = {
  slug: string;
  title: string;
  duration: string;
  days: number;
  price: number; // starting price per person by plane, in EGP; 0 = not set yet, shown as "اسأل عن السعر"
  summary: string;
  itinerary: TripDay[];
  image: { src: string; alt: string };
};

/** Shown instead of a trip price that isn't set yet. */
export const ASK_TRIP_PRICE = "اسأل عن السعر";

const BASE_DAYS: TripDay[] = [
  {
    title: "اليوم الأول: الوصول والنيل",
    items: [
      "الاستقبال من المطار أو محطة القطر، والتوصيل للفندق.",
      "جولة بالمسلة الناقصة والسد العالي.",
      "فلوكة في النيل وقت الغروب حوالين جزيرة النباتات.",
    ],
  },
  {
    title: "اليوم التاني: معبد فيلة والقرية النوبية",
    items: [
      "معبد فيلة بالمركب من مرسى الشلال.",
      "المتحف النوبي.",
      "مركب لغرب سهيل، وزيارة بيت نوبي على الغدا، ووقت حر في القرية.",
    ],
  },
];

const LAST_DAY: TripDay = {
  title: "اليوم الأخير: السوق والرجوع",
  items: ["جولة في سوق أسوان للتوابل والكركديه والهدايا.", "التوصيل للمطار أو المحطة."],
};

export const TRIPS: Trip[] = [
  {
    slug: "aswan-3-days",
    title: "أسوان في 3 أيام",
    duration: "3 أيام (ليلتين)",
    days: 3,
    price: 0,
    summary: "النيل والفلوكة، ومعبد فيلة، والمسلة الناقصة والسد العالي، وغدا في بيت نوبي في غرب سهيل.",
    itinerary: [...BASE_DAYS, { ...LAST_DAY, title: "اليوم التالت: السوق والرجوع" }],
    image: { src: "/images/trips/nile.webp", alt: "معبد فيلة على النيل" },
  },
  {
    slug: "aswan-abu-simbel-4-days",
    title: "أسوان وأبو سمبل في 4 أيام",
    duration: "4 أيام (3 ليالي)",
    days: 4,
    price: 0,
    summary: "برنامج الـ 3 أيام كامل، ويوم زيادة لمعبدين أبو سمبل: معبد رمسيس التاني ومعبد نفرتاري.",
    itinerary: [
      ...BASE_DAYS,
      {
        title: "اليوم التالت: أبو سمبل",
        items: [
          "التحرك بدري الفجر، والطريق حوالي 3 ساعات ونص.",
          "زيارة معبدين أبو سمبل: معبد رمسيس التاني ومعبد نفرتاري.",
          "الرجوع لأسوان بعد الضهر، وليلة هادية على النيل.",
        ],
      },
      { ...LAST_DAY, title: "اليوم الرابع: السوق والرجوع" },
    ],
    image: { src: "/images/trips/temple.webp", alt: "تماثيل معبد أبو سمبل" },
  },
];

export const TRIP_INCLUDES = [
  "الإقامة",
  "السفر لأسوان رايح جاي بالقطر أو بالطيارة حسب اختيارك",
  "الانتقالات",
  "المراكب",
  "المرشد",
  "الفطار يومياً، والغدا في البيت النوبي",
];

export const TRIP_EXCLUDES = ["تذاكر دخول الأماكن الأثرية", "باقي الوجبات"];

/** Each program has its own page; this is the link to it. */
export function tripHref(t: Trip) {
  return `/aswan-nubia/${t.slug}`;
}
