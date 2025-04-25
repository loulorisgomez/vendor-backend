import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Html5Qrcode } from "html5-qrcode";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [barcode, setBarcode] = useState('');
  const [message, setMessage] = useState('');
  const [scanning, setScanning] = useState(false);
  const [foundProduct, setFoundProduct] = useState(null);
  const [adjustedQuantity, setAdjustedQuantity] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [useExistingProduct, setUseExistingProduct] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!barcode) {
      setMessage('❌ Barcode is required.');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 🛡 Check if barcode already exists
    const { data: existing, error: lookupError } = await supabase
      .from('inventory')
      .select('id')
      .eq('barcode', barcode)
      .single();

    if (existing) {
      setMessage('❌ Barcode already exists. Please scan a different product.');
      return;
    }

    const product = {
      vendor_id: "1c4f0042-730b-48eb-ab46-83a560bbecea",
      product_name: productName,
      description,
      price: Number(price),
      quantity: Number(quantity),
      size,
      color,
      barcode
    };

    console.log('🚀 Saving to Supabase:', product);

    const { data, error } = await supabase
      .from('inventory')
      .insert([product]);

    if (error) {
      console.error('❌ Error saving product:', error);
      setMessage(`❌ Failed to save product: ${error.message}`);
    } else {
      console.log('✅ Product saved:', data);
      setMessage('✅ Product saved to inventory!');
      resetForm();
    }
  };

  const resetForm = () => {
    setProductName('');
    setDescription('');
    setPrice('');
    setQuantity('');
    setSize('');
    setColor('');
    setBarcode('');
    setFoundProduct(null);
    setUseExistingProduct(false);
  };

  const startScanner = () => {
    const scannerId = "scanner";

    if (!scanning) {
      const html5QrCode = new Html5Qrcode(scannerId);

      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          console.log(`🔍 Scanned Barcode: ${decodedText}`);
          setBarcode(decodedText);
          html5QrCode.stop();
          setScanning(false);

          await searchProductByBarcode(decodedText);
        },
        (errorMessage) => {
          // ignore scan errors
        }
      ).catch(err => {
        console.error('Camera start error:', err);
      });

      setScanning(true);
    } else {
      Html5Qrcode.getCameras().then((cameras) => {
        const html5QrCode = new Html5Qrcode(scannerId);
        html5QrCode.stop();
        setScanning(false);
      });
    }
  };

  const searchProductByBarcode = async (scannedBarcode) => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('barcode', scannedBarcode)
      .single();

    if (error || !data) {
      console.log('🔎 No product found with this barcode.');
      setFoundProduct(null);
      setUseExistingProduct(false);
      setShowModal(false);
      setMessage('No existing product. You can create a new one.');
    } else {
      console.log('✅ Product found:', data);
      setFoundProduct(data);
      setAdjustedQuantity(data.quantity);
      setShowModal(true); // 🛎 Show modal
      setMessage('');
    }
  };

  const chooseUseExisting = () => {
    setUseExistingProduct(true);
    setShowModal(false);
    setMessage('');
  };

  const chooseAddNew = () => {
    setFoundProduct(null);
    setUseExistingProduct(false);
    setShowModal(false);
    setMessage('');
  };

  const increaseQuantity = async () => {
    const newQuantity = adjustedQuantity + 1;
    await updateQuantityInSupabase(newQuantity);
  };

  const decreaseQuantity = async () => {
    if (adjustedQuantity > 0) {
      const newQuantity = adjustedQuantity - 1;
      await updateQuantityInSupabase(newQuantity);
    }
  };

  const updateQuantityInSupabase = async (newQuantity) => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase
      .from('inventory')
      .update({ quantity: newQuantity })
      .eq('id', foundProduct.id);

    if (error) {
      console.error('❌ Failed to update quantity:', error);
      setMessage('❌ Failed to update inventory.');
    } else {
      console.log('✅ Inventory updated to', newQuantity);
      setAdjustedQuantity(newQuantity);
      setMessage('✅ Inventory updated!');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center' }}>Vendor Dashboard</h1>

      {showModal && (
        <div style={{ background: '#eee', padding: '1rem', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem' }}>
          <h3>Product Found!</h3>
          <p><strong>Name:</strong> {foundProduct?.product_name}</p>
          <p><strong>Color:</strong> {foundProduct?.color}</p>
          <p><strong>Size:</strong> {foundProduct?.size}</p>
          <p>Would you like to use this product or create a new one?</p>
          <button onClick={chooseUseExisting} style={{ marginRight: '1rem', padding: '8px 16px' }}>Use Product</button>
          <button onClick={chooseAddNew} style={{ padding: '8px 16px' }}>Add New Product</button>
        </div>
      )}

      {!useExistingProduct && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <input type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} required />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />
          <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
          <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <input type="text" placeholder="Size" value={size} onChange={(e) => setSize(e.target.value)} />
          <input type="text" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} />
          <input type="text" placeholder="Barcode (optional)" value={barcode} onChange={(e) => setBarcode(e.target.value)} />

          <div id="scanner" style={{ width: "100%", display: scanning ? "block" : "none", marginBottom: "1rem" }}></div>

          <button
            type="button"
            onClick={startScanner}
            style={{ padding: '10px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {scanning ? "Stop Scanning" : "Scan Barcode"}
          </button>

          <button
            type="submit"
            style={{ padding: '10px', backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Save Product
          </button>
        </form>
      )}

      {useExistingProduct && foundProduct && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h3>Product: {foundProduct.product_name}</h3>
          <p><strong>Color:</strong> {foundProduct.color}</p>
          <p><strong>Size:</strong> {foundProduct.size}</p>
          <p><strong>Quantity:</strong> {adjustedQuantity}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={decreaseQuantity} style={{ padding: '10px', fontSize: '20px' }}>➖</button>
            <button type="button" onClick={increaseQuantity} style={{ padding: '10px', fontSize: '20px' }}>➕</button>
          </div>
          <button onClick={chooseAddNew} style={{ marginTop: '1rem' }}>
  Return to Add New Product
</button>

          {message && <p style={{ marginTop: '1rem', color: message.startsWith('✅') ? 'green' : 'red' }}>{message}</p>}
        </div>
      )}
    </div>
  );
}
