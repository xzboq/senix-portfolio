import { notFound } from "next/navigation";

// Любой неизвестный адрес внутри языка → 404 с общим каркасом сайта.
export default function CatchAll() {
  notFound();
}
