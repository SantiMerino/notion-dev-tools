/** The post header and a few lines of body, in outline. */
export default function Loading() {
  const bar = "animate-pulse rounded-sm bg-surface-hover";

  return (
    <div aria-busy="true">
      <span className={`block h-3 w-20 ${bar}`} />
      <span className={`mt-12 block h-8 w-3/4 ${bar}`} />
      <span className={`mt-5 block h-3 w-48 ${bar}`} />
      <hr className="border-line my-10" />
      <div className="space-y-3">
        <span className={`block h-4 w-full ${bar}`} />
        <span className={`block h-4 w-full ${bar}`} />
        <span className={`block h-4 w-2/3 ${bar}`} />
      </div>
    </div>
  );
}
