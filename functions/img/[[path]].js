export async function onRequestGet(context) {
  const path = context.params.path;

  const key = Array.isArray(path)
    ? path.join("/")
    : path;

  const object = await context.env.BUCKET.get(key);

  if (object === null) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();

  object.writeHttpMetadata(headers);

  if (!headers.has("content-type")) {
    if (key.endsWith(".jpeg") || key.endsWith(".jpg")) {
      headers.set("content-type", "image/jpeg");
    } else if (key.endsWith(".png")) {
      headers.set("content-type", "image/png");
    } else if (key.endsWith(".webp")) {
      headers.set("content-type", "image/webp");
    }
  }

  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("etag", object.httpEtag);

  return new Response(object.body, {
    headers
  });
}