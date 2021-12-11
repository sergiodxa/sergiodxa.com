import { marked, Renderer } from "marked";
import { renderToString } from "react-dom/server";

export class GitHubRenderer extends Renderer {
  constructor(private repo: string) {
    super();
  }

  image(src: string, alt: string | null) {
    let url = src.startsWith("http")
      ? src
      : `https://github.com/sergiodxa/${this.repo}/raw/main/${src}`;
    return renderToString(<img src={url} alt={alt ?? ""} />);
  }
}

export class TextRenderer extends Renderer {
  image() {
    return "[image]";
  }

  br() {
    return "\n";
  }

  hr() {
    return "[hr]";
  }

  checkbox() {
    return "[checkbox]";
  }

  del(text: string) {
    return `~${text}~`;
  }

  em(text: string) {
    return `_${text}_`;
  }

  strong(text: string) {
    return `**${text}**`;
  }

  table() {
    return "[table]";
  }

  list(body: string, _ordered: boolean) {
    return body;
  }

  listitem(text: string) {
    return `* ${text}`;
  }

  link(_href: string, _title: string, text: string) {
    return text;
  }

  paragraph(text: string) {
    return text;
  }

  heading(text: string, _level: number) {
    return text;
  }

  codespan(text: string) {
    return text;
  }

  code(_code: string, _lang: string) {
    return "[code]";
  }

  blockquote(quote: string) {
    return quote;
  }
}

export function render(
  markdown: string,
  options: marked.MarkedOptions = {}
): string {
  return marked(markdown, {
    ...options,
    breaks: true,
    gfm: true,
    headerIds: true,
  });
}
