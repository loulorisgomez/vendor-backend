import { useState } from 'react';
import { Html5Qrcode } from "html5-qrcode";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const [inventoryType, setInventoryType] = useState(null); // "new" or "used"
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [productData, setProductData] = useState(null); // Data from Supabase if found
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const resetForm = () => {
    setBarcode('');
    setProductData(null);
    setProductName('');
    setDescription('');
    setPrice('');
    setQuantity('');
    setSize('');
    setColor('');
    setMessage('');
    setErrorMessage('');
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

          await checkBarcode(decodedText);
        },
        (errorMessage) => {
          console.error('Camera error:', errorMessage);
        }
      ).catch(err => {
        console.error('Camera start error:', err);
      });
      setScanning(true);
    } else {
      Html5Qrcode.getCameras().then(() => {
        const html5QrCode = new Html5Qrcode(scannerId);
        html5QrCode.stop();
        setScanning(false);
      });
    }
  };

  const checkBarcode = async (scannedBarcode) => {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const table = inventoryType === 'new' ? 'new_inventory' : 'used_inventory';

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('barcode', scannedBarcode)
      .maybeSingle();

    if (error) {
      console.error('❌ Error checking barcode:', error);
      setErrorMessage('Error checking barcode.');
    } else if (data) {
      console.log('✅ Product Found:', data);
      setProductData(data);
      setQuantity(data.quantity || 0);
    } else {
      console.log('🔍 No matching product found.');
      setProductData(null);
    }
  };

  const adjustQuantity = (amount) => {
    setQuantity((prev) => Math.max(0, parseInt(prev || 0) + amount));
  };

  const saveQuantityUpdate = async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const table = inventoryType === 'new' ? 'new_inventory' : 'used_inventory';

    const { error } = await supabase
      .from(table)
      .update({ quantity: quantity })
      .eq('id', productData.id);

    if (error) {
      console.error('❌ Error updating quantity:', error);
      setErrorMessage('Failed to update quantity.');
    } else {
      console.log('✅ Quantity updated!');
      setMessage('✅ Quantity updated!');
      resetForm();
    }
  };

  const handleSubmitNewProduct = async (e) => {
    e.preventDefault();

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const table = inventoryType === 'new' ? 'new_inventory' : 'used_inventory';

    if (!productName || !price || !size || !barcode) {
      setErrorMessage('Please fill all required fields.');
      return;
    }

    const product = {
      vendor_id: "1c4f0042-730b-48eb-ab46-83a560bbecea", // 🔥 Temporary vendor ID
      product_name: productName,
      description,
      price: Number(price),
      quantity: Number(quantity),
      size,
      color,
      barcode
    };

    const { error } = await supabase
      .from(table)
      .insert([product]);

    if (error) {
      console.error('❌ Error creating product:', error);
      setErrorMessage('Failed to create new product.');
    } else {
      console.log('✅ Product created!');
      setMessage('✅ Product added to inventory!');
      resetForm();
    }
  };

  const sizeOptions = [
    "4M/5.5W", "4.5M/6W", "5M/6.5W", "5.5M/7W", "6M/7.5W", "6.5M/8W",
    "7M/8.5W", "7.5M/9W", "8M/9.5W", "8.5M/10W", "9M/10.5W", "9.5M/11W",
    "10M/11.5W", "10.5M/12W", "11M/12.5W", "11.5M/13W", "12M/13.5W",
    "12.5M/14W", "13M/14.5W", "13.5M/15W", "14M/15.5W"
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center' }}>Vendor Dashboard</h1>

      {!inventoryType && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h3>What would you like to add?</h3>
          <button onClick={() => setInventoryType('new')} style={{ marginRight: '1rem', padding: '10px 20px' }}>
            Add New Inventory
          </button>
          <button onClick={() => setInventoryType('used')} style={{ padding: '10px 20px' }}>
            Add Used Inventory
          </button>
        </div>
      )}

      {inventoryType && (
        <>
          {!barcode && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <button onClick={startScanner} style={{ padding: '10px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '4px' }}>
                  {scanning ? "Stop Scanning" : "Scan Barcode"}
                </button>
              </div>
              <div id="scanner" style={{ width: "100%", display: scanning ? "block" : "none", marginBottom: "1rem" }}></div>
            </>
          )}

          {barcode && productData && (
            <div style={{ textAlign: 'center' }}>
              <h3>Product Found: {productData.product_name}</h3>
              <p>Size: {productData.size}</p>
              <p>Current Quantity: {quantity}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => adjustQuantity(-1)}>-</button>
                <button onClick={() => adjustQuantity(1)}>+</button>
              </div>
              <button onClick={saveQuantityUpdate} style={{ marginTop: '1rem', padding: '10px', backgroundColor: 'black', color: 'white', border: 'none' }}>
                Save Changes
              </button>
            </div>
          )}

          {barcode && !productData && (
            <form onSubmit={handleSubmitNewProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3>Add New Product</h3>

              <input type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} required />
              <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>$</span>
                <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>

              <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />

              <select value={size} onChange={(e) => setSize(e.target.value)} required>
                <option value="">Select Size</option>
                {sizeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <input type="text" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} />
              <input type="text" placeholder="Barcode" value={barcode} readOnly />

              <button type="submit" style={{ padding: '10px', backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Save Product
              </button>
            </form>
          )}
        </>
      )}

      {errorMessage && <p style={{ marginTop: '1rem', color: 'red' }}>{errorMessage}</p>}
      {message && <p style={{ marginTop: '1rem', color: 'green' }}>{message}</p>}
    </div>
  );
}
