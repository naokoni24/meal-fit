const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

interface UnsplashPhoto {
  urls: { small: string };
  user: { name: string; links: { html: string } };
}

export interface UnsplashImage {
  url: string;
  creditName: string;
  creditUrl: string;
}

export async function fetchFoodImage(query: string): Promise<UnsplashImage | null> {
  if (!ACCESS_KEY) return null;
  try {
    // "food" を末尾に付けることで食べ物写真に絞り込む
    const q = encodeURIComponent(`${query} food`);
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${q}&per_page=5&orientation=landscape&content_filter=high&client_id=${ACCESS_KEY}`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { results: UnsplashPhoto[] };
    // ランダムではなく最も関連度が高い1枚目を使う
    const photo = data.results[0];
    if (!photo) return null;
    return {
      url: photo.urls.small,
      creditName: photo.user.name,
      creditUrl: `${photo.user.links.html}?utm_source=yorugohan_ai&utm_medium=referral`,
    };
  } catch {
    return null;
  }
}
