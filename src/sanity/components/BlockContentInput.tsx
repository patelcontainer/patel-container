"use client";

import type { InputProps, PortableTextInputProps } from "sanity";
import { pasteTables } from "../lib/pasteTables";

/** Rich text input that keeps tables when pasting from Google Docs, Word, Excel or web pages. */
export function BlockContentInput(props: InputProps) {
  const pt = props as PortableTextInputProps;
  return pt.renderDefault({ ...pt, onPaste: pasteTables });
}
