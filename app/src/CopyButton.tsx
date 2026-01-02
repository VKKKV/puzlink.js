import { useRef, useState, type JSX } from "react";

export function CopyButton({
  content: getContent,
  children: Children,
}: {
  content: () =>
    | string
    | ClipboardItem
    | null
    | undefined
    | Promise<string | ClipboardItem | null | undefined>;
  children: (props: {
    justCopied: boolean;
    onClick: () => void;
  }) => JSX.Element;
}) {
  const [justCopied, setJustCopied] = useState(false);
  const copyTimeout = useRef<number | null>(null);

  const handleCopy = async () => {
    const content = await getContent();

    if (!content) {
      return false;
    }

    await navigator.clipboard.write([
      content instanceof ClipboardItem
        ? content
        : new ClipboardItem({ "text/plain": content }),
    ]);

    if (copyTimeout.current !== null) {
      clearTimeout(copyTimeout.current);
    }
    setJustCopied(true);
    copyTimeout.current = setTimeout(() => {
      setJustCopied(false);
    }, 2000);

    return true;
  };

  return <Children justCopied={justCopied} onClick={() => void handleCopy()} />;
}
