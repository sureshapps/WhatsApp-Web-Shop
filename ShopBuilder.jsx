import { useState, useMemo, useRef } from "react";
import { Plus, Minus, X, Trash2, Mail, MessageCircle, ShoppingBag, Copy, Check, ImagePlus } from "lucide-react";

// ---------- helpers ----------
const uid = () => Math.random().toString(36).slice(2, 9);

const currency = (n, cur) =>
  `${cur} ${Number(n || 0).toFixed(2)}`;

const seedProducts = [
  {
    id: uid(),
    name: "Aura Shaper",
    description: "Reshape energies – the HarmonySculpt Aura Shaper harmonizes your surroundings.",
    price: 12,
    image:
      "https://images.unsplash.com/photo-1590502593389-e15fa5636a1a?w=400&h=400&fit=crop",
  },
  {
    id: uid(),
    name: "Connection Orb",
    description: "Forge seamless bonds through the EchoRipple Connection Orb's shared experiences.",
    price: 16,
    image:
      "https://images.unsplash.com/photo-1590502593389-e15fa5636a1a?w=400&h=400&fit=crop",
  },
  {
    id: uid(),
    name: "Echo Quill",
    description: "Write futures with the NovaScribe Echo Quill, where words resonate destiny.",
    price: 13,
    image:
      "https://images.unsplash.com/photo-1590502593389-e15fa5636a1a?w=400&h=400&fit=crop",
  },
];

// ---------- main app ----------
export default function ShopBuilder() {
  const [products, setProducts] = useState(seedProducts);
  const [shopName, setShopName] = useState("Little Citrus Co.");
  const [currency_, setCurrency] = useState("EUR");
  const [channel, setChannel] = useState("whatsapp"); // whatsapp | email
  const [phone, setPhone] = useState("+1 234 567 890");
  const [email, setEmail] = useState("orders@yourshop.com");
  const [accent, setAccent] = useState("#FFD400");
  const [cart, setCart] = useState({}); // id -> qty
  const [tab, setTab] = useState("products"); // products | destination | embed
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ ...products.find((p) => p.id === id), qty }))
        .filter((i) => i.id),
    [cart, products]
  );

  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const setQty = (id, qty) => {
    setCart((c) => ({ ...c, [id]: Math.max(0, qty) }));
  };

  const addProduct = () => {
    const p = {
      id: uid(),
      name: "New product",
      description: "Describe what makes this worth buying.",
      price: 10,
      image:
        "https://images.unsplash.com/photo-1590502593389-e15fa5636a1a?w=400&h=400&fit=crop",
    };
    setProducts((ps) => [...ps, p]);
    setEditingId(p.id);
  };

  const updateProduct = (id, patch) =>
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const removeProduct = (id) => {
    setProducts((ps) => ps.filter((p) => p.id !== id));
    setCart((c) => {
      const n = { ...c };
      delete n[id];
      return n;
    });
  };

  const buildMessage = () => {
    const lines = [
      `Hi ${shopName},`,
      `I'd like to order:`,
      "",
      ...cartItems.map(
        (i) => `${i.name} × ${i.qty} — ${currency(i.price * i.qty, currency_)}`
      ),
      "",
      `Total: ${currency(total, currency_)}`,
    ];
    return lines.join("\n");
  };

  const sendOrder = () => {
    const message = buildMessage();
    if (channel === "whatsapp") {
      const digits = phone.replace(/[^\d]/g, "");
      const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    } else {
      const subject = encodeURIComponent(`Order from ${shopName}`);
      const body = encodeURIComponent(message);
      window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
    }
  };

  const embedCode = useMemo(() => {
    return `<script src="https://shopwidget.example/embed.js"
  data-shop="${shopName.replace(/"/g, "&quot;")}"
  data-currency="${currency_}"
  data-channel="${channel}"
  data-${channel === "whatsapp" ? "phone" : "email"}="${channel === "whatsapp" ? phone : email}"
  data-accent="${accent}">
</script>`;
  }, [shopName, currency_, channel, phone, email, accent]);

  const copyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      // no-op
    }
  };

  return (
    <div style={styles.app}>
      {/* ---------- Header ---------- */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.brandMark}>
            <div style={{ ...styles.brandDot, background: accent }} />
            <span style={styles.brandWord}>peel</span>
          </div>
          <p style={styles.headerTag}>
            Product cards that end in a real order — sent straight to your phone or inbox.
          </p>
        </div>
      </header>

      <main style={styles.main}>
        {/* ---------- Left: builder ---------- */}
        <section style={styles.builder}>
          <nav style={styles.tabs}>
            {[
              ["products", "Products"],
              ["destination", "Where orders go"],
              ["embed", "Add to site"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  ...styles.tabBtn,
                  ...(tab === key ? { ...styles.tabBtnActive, borderColor: accent } : {}),
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          {tab === "products" && (
            <div style={styles.panel}>
              <div style={styles.panelRow}>
                <label style={styles.fieldLabel}>Shop name</label>
                <input
                  style={styles.input}
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                />
              </div>
              <div style={styles.panelRow}>
                <label style={styles.fieldLabel}>Currency</label>
                <select
                  style={styles.input}
                  value={currency_}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {["EUR", "USD", "GBP", "CAD", "AUD"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.panelRow}>
                <label style={styles.fieldLabel}>Accent color</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="color"
                    value={accent}
                    onChange={(e) => setAccent(e.target.value)}
                    style={styles.swatch}
                  />
                  <span style={styles.mono}>{accent}</span>
                </div>
              </div>

              <div style={styles.divider} />

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {products.map((p) => (
                  <ProductEditor
                    key={p.id}
                    product={p}
                    currency={currency_}
                    isEditing={editingId === p.id}
                    onToggle={() => setEditingId(editingId === p.id ? null : p.id)}
                    onChange={(patch) => updateProduct(p.id, patch)}
                    onRemove={() => removeProduct(p.id)}
                  />
                ))}
              </div>

              <button style={styles.addProductBtn} onClick={addProduct}>
                <Plus size={16} strokeWidth={2.5} /> Add a product
              </button>
            </div>
          )}

          {tab === "destination" && (
            <div style={styles.panel}>
              <p style={styles.panelIntro}>
                Pick where finished orders should land. Shoppers never see this — they just
                tap Send.
              </p>
              <div style={styles.channelRow}>
                <button
                  onClick={() => setChannel("whatsapp")}
                  style={{
                    ...styles.channelBtn,
                    ...(channel === "whatsapp"
                      ? { ...styles.channelBtnActive, borderColor: accent }
                      : {}),
                  }}
                >
                  <MessageCircle size={18} /> WhatsApp
                </button>
                <button
                  onClick={() => setChannel("email")}
                  style={{
                    ...styles.channelBtn,
                    ...(channel === "email"
                      ? { ...styles.channelBtnActive, borderColor: accent }
                      : {}),
                  }}
                >
                  <Mail size={18} /> Email
                </button>
              </div>

              {channel === "whatsapp" ? (
                <div style={styles.panelRow}>
                  <label style={styles.fieldLabel}>WhatsApp number (with country code)</label>
                  <input
                    style={styles.input}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 890"
                  />
                </div>
              ) : (
                <div style={styles.panelRow}>
                  <label style={styles.fieldLabel}>Order inbox email</label>
                  <input
                    style={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="orders@yourshop.com"
                  />
                </div>
              )}

              <div style={styles.hintBox}>
                <p style={styles.hintText}>
                  When a shopper taps <strong>Send</strong>, this opens{" "}
                  {channel === "whatsapp" ? "WhatsApp" : "their email app"} pre-filled with
                  every item, quantity, and the total — nothing to type, nothing to miss.
                </p>
              </div>
            </div>
          )}

          {tab === "embed" && (
            <div style={styles.panel}>
              <p style={styles.panelIntro}>
                Paste this where you want the shop to appear on your site. It renders the
                cards, the cart, and the {channel === "whatsapp" ? "WhatsApp" : "email"} send
                button — no other setup.
              </p>
              <div style={styles.codeBlock}>
                <pre style={styles.codePre}>{embedCode}</pre>
                <button style={styles.copyBtn} onClick={copyEmbed}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div style={styles.hintBox}>
                <p style={styles.hintText}>
                  Every edit on the Products tab updates this snippet's data automatically —
                  no rebuilding or re-pasting needed.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ---------- Right: live preview ---------- */}
        <section style={{ ...styles.previewWrap, background: accent }}>
          <span style={styles.previewLabel}>Live preview</span>
          <h2 style={styles.previewTitle}>{shopName}</h2>

          <div style={styles.grid}>
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                currency={currency_}
                qty={cart[p.id] || 0}
                accent={accent}
                onQty={(q) => setQty(p.id, q)}
              />
            ))}
            {products.length === 0 && (
              <div style={styles.emptyState}>
                <ShoppingBag size={28} strokeWidth={1.5} />
                <p>No products yet. Add one on the left to see it here.</p>
              </div>
            )}
          </div>

          {cartCount > 0 && (
            <button style={styles.sendBar} onClick={() => setCart((c) => ({ ...c, __open: true }))}>
              <span>
                Cart · {cartCount} item{cartCount > 1 ? "s" : ""}
              </span>
              <span>{currency(total, currency_)}</span>
            </button>
          )}

          {cart.__open && (
            <CartDrawer
              items={cartItems}
              currency={currency_}
              total={total}
              accent={accent}
              channel={channel}
              destination={channel === "whatsapp" ? phone : email}
              onClose={() => setCart((c) => ({ ...c, __open: false }))}
              onQty={setQty}
              onSend={sendOrder}
            />
          )}
        </section>
      </main>
    </div>
  );
}

// ---------- product editor (left panel) ----------
function ProductEditor({ product, currency, isEditing, onToggle, onChange, onRemove }) {
  return (
    <div style={styles.editorCard}>
      <button style={styles.editorHead} onClick={onToggle}>
        <img src={product.image} alt="" style={styles.editorThumb} />
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={styles.editorName}>{product.name || "Untitled"}</div>
          <div style={styles.editorPrice}>{currency} {Number(product.price || 0).toFixed(2)}</div>
        </div>
        <span style={styles.editorChevron}>{isEditing ? "–" : "+"}</span>
      </button>

      {isEditing && (
        <div style={styles.editorBody}>
          <div style={styles.panelRow}>
            <label style={styles.fieldLabelSm}>Name</label>
            <input
              style={styles.inputSm}
              value={product.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>
          <div style={styles.panelRow}>
            <label style={styles.fieldLabelSm}>Description</label>
            <textarea
              style={{ ...styles.inputSm, minHeight: 56, resize: "vertical" }}
              value={product.description}
              onChange={(e) => onChange({ description: e.target.value })}
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ ...styles.panelRow, flex: 1 }}>
              <label style={styles.fieldLabelSm}>Price</label>
              <input
                type="number"
                step="0.01"
                style={styles.inputSm}
                value={product.price}
                onChange={(e) => onChange({ price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div style={styles.panelRow}>
            <label style={styles.fieldLabelSm}>Image URL</label>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                style={{ ...styles.inputSm, flex: 1 }}
                value={product.image}
                onChange={(e) => onChange({ image: e.target.value })}
              />
            </div>
          </div>
          <button style={styles.removeBtn} onClick={onRemove}>
            <Trash2 size={14} /> Remove product
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- product card (preview) ----------
function ProductCard({ product, currency, qty, accent, onQty }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardImageWrap}>
        <img src={product.image} alt={product.name} style={styles.cardImage} />
      </div>
      <div style={styles.cardBody}>
        <h3 style={styles.cardName}>{product.name}</h3>
        <p style={styles.cardDesc}>{product.description}</p>
        <div style={styles.cardPrice}>{currency} {Number(product.price || 0).toFixed(2)}</div>

        {qty === 0 ? (
          <button
            style={{ ...styles.cartBtn, background: accent }}
            onClick={() => onQty(1)}
          >
            Add to cart
          </button>
        ) : (
          <div style={{ ...styles.stepper, borderColor: accent }}>
            <button style={styles.stepBtn} onClick={() => onQty(qty - 1)} aria-label="Decrease">
              <Minus size={15} />
            </button>
            <span style={styles.stepQty}>{qty}</span>
            <button
              style={{ ...styles.stepBtn, background: "#12131A", color: "#fff" }}
              onClick={() => onQty(qty + 1)}
              aria-label="Increase"
            >
              <Plus size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- cart drawer ----------
function CartDrawer({ items, currency, total, accent, channel, destination, onClose, onQty, onSend }) {
  return (
    <div style={styles.drawerOverlay} onClick={onClose}>
      <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div style={styles.drawerHead}>
          <h3 style={styles.drawerTitle}>Cart ({items.reduce((s, i) => s + i.qty, 0)})</h3>
          <button style={styles.drawerClose} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={styles.drawerList}>
          {items.map((i) => (
            <div key={i.id} style={styles.drawerItem}>
              <img src={i.image} alt="" style={styles.drawerThumb} />
              <div style={{ flex: 1 }}>
                <div style={styles.drawerItemName}>{i.name}</div>
                <div style={{ ...styles.stepper, borderColor: "#E7E2D6", marginTop: 6 }}>
                  <button style={styles.stepBtn} onClick={() => onQty(i.id, i.qty - 1)}>
                    <Minus size={13} />
                  </button>
                  <span style={styles.stepQty}>{i.qty}</span>
                  <button
                    style={{ ...styles.stepBtn, background: "#12131A", color: "#fff" }}
                    onClick={() => onQty(i.id, i.qty + 1)}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
              <div style={styles.drawerItemPrice}>
                {currency} {(i.price * i.qty).toFixed(2)}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p style={{ color: "#8A8672", fontSize: 14, padding: "20px 0" }}>
              Your cart is empty.
            </p>
          )}
        </div>

        <p style={styles.drawerDestination}>
          {channel === "whatsapp" ? (
            <>Sends via WhatsApp to <strong>{destination || "—"}</strong></>
          ) : (
            <>Sends via email to <strong>{destination || "—"}</strong></>
          )}
        </p>

        <button style={{ ...styles.sendCta, background: accent }} onClick={onSend}>
          <span>Send</span>
          <span>{currency} {total.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
}

// ---------- styles ----------
const styles = {
  app: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "#FBF9F3",
    minHeight: "100vh",
    color: "#12131A",
  },
  header: {
    borderBottom: "1px solid #EEEADC",
    padding: "22px 24px 20px",
    background: "#FBF9F3",
  },
  headerInner: { maxWidth: 1100, margin: "0 auto" },
  brandMark: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  brandDot: { width: 14, height: 14, borderRadius: "50%" },
  brandWord: {
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    fontWeight: 700,
    fontSize: 22,
    letterSpacing: "-0.02em",
  },
  headerTag: { fontSize: 14, color: "#5C5946", maxWidth: 460, lineHeight: 1.5, margin: 0 },

  main: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) minmax(0,1.15fr)",
    gap: 20,
    padding: "24px",
    alignItems: "start",
  },

  builder: {
    background: "#fff",
    borderRadius: 20,
    border: "1px solid #EEEADC",
    overflow: "hidden",
    position: "sticky",
    top: 24,
  },
  tabs: { display: "flex", borderBottom: "1px solid #EEEADC" },
  tabBtn: {
    flex: 1,
    padding: "14px 8px",
    border: "none",
    borderBottom: "2px solid transparent",
    background: "transparent",
    fontSize: 13,
    fontWeight: 600,
    color: "#8A8672",
  },
  tabBtnActive: { color: "#12131A" },
  panel: { padding: 20, display: "flex", flexDirection: "column", gap: 14 },
  panelIntro: { fontSize: 13.5, color: "#5C5946", lineHeight: 1.55, margin: "0 0 4px" },
  panelRow: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 12.5, fontWeight: 600, color: "#5C5946" },
  fieldLabelSm: { fontSize: 11.5, fontWeight: 600, color: "#8A8672" },
  input: {
    border: "1px solid #E7E2D6",
    borderRadius: 10,
    padding: "9px 11px",
    fontSize: 14,
    background: "#FBF9F3",
    color: "#12131A",
  },
  inputSm: {
    border: "1px solid #E7E2D6",
    borderRadius: 8,
    padding: "7px 9px",
    fontSize: 13,
    background: "#FBF9F3",
    color: "#12131A",
  },
  swatch: { width: 34, height: 34, border: "none", borderRadius: 8, padding: 0, background: "none" },
  mono: { fontFamily: "monospace", fontSize: 13, color: "#5C5946" },
  divider: { height: 1, background: "#EEEADC", margin: "2px 0" },

  editorCard: { border: "1px solid #EEEADC", borderRadius: 14, overflow: "hidden" },
  editorHead: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 10,
    width: "100%",
    border: "none",
    background: "#FBF9F3",
  },
  editorThumb: { width: 40, height: 40, borderRadius: 8, objectFit: "cover", background: "#eee" },
  editorName: { fontSize: 13.5, fontWeight: 600 },
  editorPrice: { fontSize: 12, color: "#8A8672", marginTop: 1 },
  editorChevron: { fontSize: 18, color: "#8A8672", width: 20, textAlign: "center" },
  editorBody: { padding: 12, display: "flex", flexDirection: "column", gap: 10, background: "#fff" },
  removeBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    border: "1px solid #F0D8D6",
    color: "#B3402F",
    background: "#FDF4F3",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 12.5,
    fontWeight: 600,
    marginTop: 4,
  },
  addProductBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: "1.5px dashed #D8D3C2",
    borderRadius: 12,
    padding: "11px",
    fontSize: 13.5,
    fontWeight: 600,
    color: "#12131A",
    background: "transparent",
  },

  channelRow: { display: "flex", gap: 8 },
  channelBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "11px",
    borderRadius: 10,
    border: "1.5px solid #E7E2D6",
    background: "#FBF9F3",
    fontSize: 13.5,
    fontWeight: 600,
  },
  channelBtnActive: { background: "#fff" },
  hintBox: { background: "#FBF9F3", border: "1px solid #EEEADC", borderRadius: 12, padding: 12 },
  hintText: { fontSize: 12.5, color: "#5C5946", lineHeight: 1.55, margin: 0 },

  codeBlock: { position: "relative", background: "#12131A", borderRadius: 12, padding: 14 },
  codePre: {
    color: "#E9E6D8",
    fontSize: 11.5,
    lineHeight: 1.6,
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    fontFamily: "'SF Mono', monospace",
  },
  copyBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "#FFD400",
    color: "#12131A",
    border: "none",
    borderRadius: 7,
    padding: "6px 9px",
    fontSize: 12,
    fontWeight: 700,
  },

  previewWrap: {
    borderRadius: 24,
    padding: "26px 22px 90px",
    position: "relative",
    minHeight: 400,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(18,19,26,0.55)",
  },
  previewTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    margin: "4px 0 20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: 14,
  },
  emptyState: {
    gridColumn: "1 / -1",
    background: "rgba(255,255,255,0.6)",
    borderRadius: 16,
    padding: 30,
    textAlign: "center",
    color: "#5C5946",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    fontSize: 13.5,
  },

  card: {
    background: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 1px 2px rgba(18,19,26,0.06)",
  },
  cardImageWrap: { aspectRatio: "1 / 1", background: "#F1EEE3", overflow: "hidden" },
  cardImage: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  cardBody: { padding: "12px 12px 14px", display: "flex", flexDirection: "column", gap: 4 },
  cardName: { fontSize: 14.5, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" },
  cardDesc: {
    fontSize: 11.5,
    color: "#8A8672",
    margin: "0 0 2px",
    lineHeight: 1.4,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardPrice: { fontSize: 13.5, fontWeight: 700, margin: "2px 0 8px" },
  cartBtn: {
    border: "none",
    borderRadius: 10,
    padding: "10px 0",
    fontSize: 12.5,
    fontWeight: 700,
    color: "#12131A",
  },
  stepper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "1.5px solid",
    borderRadius: 10,
    padding: "3px",
  },
  stepBtn: {
    border: "none",
    background: "#F1EEE3",
    width: 26,
    height: 26,
    borderRadius: 7,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepQty: { fontSize: 13, fontWeight: 700, minWidth: 18, textAlign: "center" },

  sendBar: {
    position: "absolute",
    left: 22,
    right: 22,
    bottom: 22,
    background: "#12131A",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "15px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
    fontWeight: 700,
  },

  drawerOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(18,19,26,0.45)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    borderRadius: 24,
    padding: 0,
  },
  drawer: {
    background: "#fff",
    width: "100%",
    borderRadius: "20px 20px 0 0",
    padding: 20,
    maxHeight: "88%",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  drawerHead: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  drawerTitle: { fontSize: 17, fontWeight: 700, margin: 0 },
  drawerClose: { border: "none", background: "#F1EEE3", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" },
  drawerList: { display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" },
  drawerItem: { display: "flex", gap: 10, alignItems: "center" },
  drawerThumb: { width: 46, height: 46, borderRadius: 10, objectFit: "cover", background: "#eee" },
  drawerItemName: { fontSize: 13.5, fontWeight: 600 },
  drawerItemPrice: { fontSize: 13, fontWeight: 700 },
  drawerDestination: { fontSize: 12, color: "#8A8672", margin: 0 },
  sendCta: {
    border: "none",
    borderRadius: 12,
    padding: "15px 18px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: 14.5,
    fontWeight: 700,
    color: "#12131A",
  },
};
