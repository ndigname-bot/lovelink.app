import GiftViewer from "@/components/GiftViewer";
import { getGiftMetadata } from "@/lib/giftMetadata";

export async function generateMetadata({ params }) {
  const unwrappedParams = await params;
  return getGiftMetadata(unwrappedParams?.id);
}

export default function GiftPage(props) {
  return <GiftViewer {...props} />;
}
