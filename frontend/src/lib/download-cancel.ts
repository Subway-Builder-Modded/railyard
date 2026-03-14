const DOWNLOAD_CANCEL_EVENT = "railyard:download-cancelled";

type DownloadCancelDetail = {
  itemId: string;
};

export function emitDownloadCancelled(itemId: string) {
  window.dispatchEvent(
    new CustomEvent<DownloadCancelDetail>(DOWNLOAD_CANCEL_EVENT, {
      detail: { itemId },
    }),
  );
}

export function onDownloadCancelled(
  handler: (detail: DownloadCancelDetail) => void,
) {
  const listener: EventListener = (event) => {
    const customEvent = event as CustomEvent<DownloadCancelDetail>;
    if (!customEvent.detail?.itemId) {
      return;
    }
    handler(customEvent.detail);
  };

  window.addEventListener(DOWNLOAD_CANCEL_EVENT, listener);
  return () => window.removeEventListener(DOWNLOAD_CANCEL_EVENT, listener);
}
