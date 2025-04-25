import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Html5Qrcode } from "html5-qrcode";

export const dynamic = "force-dynamic"; // ✅ Add this to prevent pre-rendering errors!

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const product = {
      vendor_id: "1c4f0042-730b-48eb-ab46-83a560bbecea", // ✅ Your real vendor UUID
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
      setProductName('');
      setDescription('');
      setPrice('');
      setQuantity('');
      setSize('');
      setColor('');
      setBarcode('');
    }
  };

  const startScanner = () => {
    const scannerId = "scanner";

    if (!scanning) {
      const html5QrCode = new Html5Qrcode(scannerId);

      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250
        },
        (decodedText) => {
          console.log(`🔍 Scanned Barcode: ${decodedText}`);
          setBarcode(decodedText);
          html5QrCode.stop();
          setScanning(false);
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

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center' }}>Vendor Dashboard</h1>
      <h2 style={{ marginTop: '1rem' }}>Add Inventory</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        
        <input 
          type="text" 
          placeholder="Product Name" 
          value={productName} 
          onChange={(e) => setProductName(e.target.value)} 
          required 
        />

        <textarea 
          placeholder="Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          rows="3"
        />

        <input 
          type="number" 
          placeholder="Price" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)} 
          required 
        />

        <input 
          type="number" 
          placeholder="Quantity" 
          value={quantity} 
          onChange={(e) => setQuantity(e.target.value)} 
        />

        <input 
          type="text" 
          placeholder="Size" 
          value={size} 
          onChange={(e) => setSize(e.target.value)} 
        />

        <input 
          type="text" 
          placeholder="Color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)} 
        />

        <input 
          type="text" 
          placeholder="Barcode (optional)" 
          value={barcode} 
          onChange={(e) => setBarcode(e.target.value)} 
        />

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

      {message && (
        <p style={{ marginTop: '1rem', color: message.startsWith('✅') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
    </div>
  );
}
