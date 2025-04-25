{\rtf1\ansi\ansicpg1252\cocoartf2821
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ useState \} from 'react';\
\
export default function Dashboard() \{\
  const [productName, setProductName] = useState('');\
  const [description, setDescription] = useState('');\
  const [price, setPrice] = useState('');\
  const [quantity, setQuantity] = useState('');\
  const [size, setSize] = useState('');\
  const [color, setColor] = useState('');\
  const [barcode, setBarcode] = useState('');\
  const [message, setMessage] = useState('');\
\
  const handleSubmit = async (e) => \{\
    e.preventDefault();\
    \
    const product = \{\
      productName,\
      description,\
      price,\
      quantity,\
      size,\
      color,\
      barcode\
    \};\
\
    console.log('\uc0\u55357 \u56960  New Inventory Product:', product);\
\
    // \uc0\u55357 \u56604  We'll replace this console log with a real Supabase insert in the next step!\
\
    setMessage('\uc0\u9989  Product saved locally (Supabase connection coming next)');\
    // Clear form\
    setProductName('');\
    setDescription('');\
    setPrice('');\
    setQuantity('');\
    setSize('');\
    setColor('');\
    setBarcode('');\
  \};\
\
  return (\
    <div style=\{\{ padding: '2rem', maxWidth: '600px', margin: 'auto' \}\}>\
      <h1 style=\{\{ textAlign: 'center' \}\}>Vendor Dashboard</h1>\
      <h2 style=\{\{ marginTop: '1rem' \}\}>Add Inventory</h2>\
      <form onSubmit=\{handleSubmit\} style=\{\{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' \}\}>\
        \
        <input \
          type="text" \
          placeholder="Product Name" \
          value=\{productName\} \
          onChange=\{(e) => setProductName(e.target.value)\} \
          required \
        />\
\
        <textarea \
          placeholder="Description" \
          value=\{description\} \
          onChange=\{(e) => setDescription(e.target.value)\} \
          rows="3"\
        />\
\
        <input \
          type="number" \
          placeholder="Price" \
          value=\{price\} \
          onChange=\{(e) => setPrice(e.target.value)\} \
          required \
        />\
\
        <input \
          type="number" \
          placeholder="Quantity" \
          value=\{quantity\} \
          onChange=\{(e) => setQuantity(e.target.value)\} \
        />\
\
        <input \
          type="text" \
          placeholder="Size" \
          value=\{size\} \
          onChange=\{(e) => setSize(e.target.value)\} \
        />\
\
        <input \
          type="text" \
          placeholder="Color" \
          value=\{color\} \
          onChange=\{(e) => setColor(e.target.value)\} \
        />\
\
        <input \
          type="text" \
          placeholder="Barcode (optional)" \
          value=\{barcode\} \
          onChange=\{(e) => setBarcode(e.target.value)\} \
        />\
\
        <button type="submit" style=\{\{ padding: '10px', backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' \}\}>\
          Save Product\
        </button>\
\
      </form>\
\
      \{message && (\
        <p style=\{\{ marginTop: '1rem', color: 'green' \}\}>\{message\}</p>\
      )\}\
    </div>\
  );\
\}\
}