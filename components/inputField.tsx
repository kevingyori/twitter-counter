import { PLACEHOLDER, URL_REGEX } from "@/lib/constants";
import { getCharCount } from "@/lib/getCharCount";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type InputFieldProps = {
  inputRef: React.MutableRefObject<HTMLDivElement | null>,
  content: string,
  setContent: React.Dispatch<React.SetStateAction<string>>,
  setCharCount: React.Dispatch<React.SetStateAction<number>>,
  setSelection: React.Dispatch<React.SetStateAction<string>>,
};

export default function InputField({ inputRef, content, setContent, setCharCount, setSelection }: InputFieldProps) {
  const [isEmpty, setIsEmpty] = useState(true);

  // style urls in content
  useEffect(() => {
    console.log("content changed");
    if (inputRef.current) {
      let text = inputRef?.current?.innerText ?? "";
      console.log(text);
      const matches = text.match(URL_REGEX);
      // store cursor text location
      const cursorLocation = window?.getSelection()?.anchorOffset ?? 0;
      if (matches) {
        console.log(matches);
        const urls = matches.map((match) => {
          return {
            url: match,
            index: text.indexOf(match),
          };
        });
        const sortedUrls = urls.sort((a, b) => b.index - a.index);
        console.log(sortedUrls);
        sortedUrls.forEach((url) => {
          text = text.replace(url.url, `<div class="highlight">${url.url}</div>`);
          console.log(text, url.url, url.index);
          if (inputRef.current) {
            inputRef.current.innerHTML = text;
          }
          // set cursor back to original location
          window?.getSelection()?.collapse(inputRef.current?.firstChild ?? null, cursorLocation);
          console.log(cursorLocation);
          console.log(inputRef.current?.firstChild);

          // const urlElement = document.createElement("a");
          // urlElement.href = url.url;
          // urlElement.target = "_blank";
          // urlElement.rel = "noopener noreferrer";
          // urlElement.textContent = url.url;
          // const textNode = document.createTextNode(
          //   text.slice(url.index + url.url.length)
          // );
          // inputRef.current?.replaceChild(
          //   textNode,
          //   inputRef.current?.childNodes[url.index]
          // );
          // inputRef.current?.insertBefore(urlElement, textNode);
        });
      }
    }
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    // console.log(ref.current?.innerText)
    // console.log(e)
    if (inputRef.current?.textContent === PLACEHOLDER) {
      setIsEmpty(false);
      inputRef.current.textContent = "";
    }
    if (inputRef.current?.textContent !== content) {
      setContent(inputRef.current?.innerText ?? "")
      setCharCount(getCharCount(inputRef.current?.innerText ?? ""))
    }
  };

  return (
    <div>
      <div
        contentEditable
        className={cn("md:w-[60ch] mt-5 min-h-[200px] text-lg flex w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hyphens-auto break-words",
          isEmpty ? "text-muted-foreground select-none" : "text-foreground"
        )}
        onInput={handleContentChange}
        ref={inputRef}
        onSelectCapture={() => {
          setSelection(window?.getSelection()?.toString() ?? "");
        }}
        onMouseUpCapture={() => {
          setSelection(window?.getSelection()?.toString() ?? "");
        }}
        onBlurCapture={() => {
          // console.log("blur", window?.getSelection()?.toString());
          setSelection('');

          // reset "Start typing!" placeholder
          if (inputRef.current?.textContent === "") {
            setIsEmpty(true);
            inputRef.current.textContent = PLACEHOLDER;
          }
        }}
        onFocus={() => {
          // clear "Start typing!" placeholder
          if (inputRef.current?.textContent === PLACEHOLDER) {
            setIsEmpty(false);
            inputRef.current.textContent = "";
          }
        }}
      >
        <p>
          {content ? content : PLACEHOLDER}
        </p>
      </div>
    </div>
  );
}
