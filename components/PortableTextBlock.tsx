import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

export default function PortableTextBlockRenderer({
  value,
}: {
  value: PortableTextBlock[];
}) {
  const components: PortableTextComponents = {
    // Personalizza qui se vuoi
    // types: {
    //   image: ({ value }) => <img src={value.asset.url} alt="..." />
    // },
  };

  return <PortableText value={value} components={components} />;
}