/**
 * Minimal ordered XML parser shared by the national-transposition corpus
 * builders (Cbw from Staatsblad XML, BSIG from gesetze-im-internet XML).
 *
 * Purpose-built for well-formed government documents: no CDATA handling, no
 * namespaces, attributes dropped (both schemas use them typographically).
 * Yields arrays of { tagName: [children] } plus { "#text": "..." } leaves —
 * document order preserved. Each builder's count/numbering assertions and
 * its verifier's verbatim probes check the parse end to end.
 */

export function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

export function parseXmlOrdered(input) {
  const root = [];
  const stack = [root];
  const TOKEN = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!DOCTYPE[^>]*>|<!\[CDATA\[[\s\S]*?\]\]>|<\/?[^>]+>|[^<]+/g;
  for (const token of input.match(TOKEN) ?? []) {
    if (token.startsWith("<!--") || token.startsWith("<?") || token.startsWith("<!DOCTYPE")) continue;
    if (token.startsWith("<![CDATA[")) {
      throw new Error("unexpected CDATA — this parser does not handle it");
    }
    if (token.startsWith("</")) {
      if (stack.length < 2) throw new Error(`unbalanced close tag ${token}`);
      stack.pop();
    } else if (token.startsWith("<")) {
      const selfClosing = /\/>$/.test(token);
      const name = token.slice(1, -1).replace(/\/$/, "").trim().split(/[\s>]/)[0];
      if (!name) throw new Error(`unparseable tag ${token}`);
      const node = { [name]: [] };
      stack[stack.length - 1].push(node);
      if (!selfClosing) stack.push(node[name]);
    } else {
      stack[stack.length - 1].push({ "#text": decodeEntities(token) });
    }
  }
  if (stack.length !== 1) throw new Error(`unclosed element(s): depth ${stack.length - 1} at EOF`);
  return root;
}

/** Direct children of a preserved-order node list with the given tag. */
export function children(nodes, tagName) {
  return (nodes ?? []).filter((n) => tagName in n).map((n) => n[tagName]);
}
