import { useState } from 'react';
import { Html5Qrcode } from "html5-qrcode";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const [inventoryType, setInventoryType] = useState(null); // "new" or "used"
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [barcode, setBarcode] = useState('');
  const [shoeCondition, setShoeCondition] = useState('');
  const [boxCondition, setBoxCondition] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [scanning, setScanning] = useState(false);

  const resetForm = () => {
    setProductName('');
    setDescription('');
    setPrice('');
    setQuantity('');
    setSize('');
    setColor('');
    setBarcode('');
    setShoeCondition('');
    setBoxCondition('');
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
        (decodedText) => {
          console.log(`🔍 Scanned Barcode: ${decodedText}`);
          setBarcode(decodedText);
          html5QrCode.stop();
          setScanning(false);
        },
        (errorMessage) => {
          // Ignore errors
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    if (!barcode || !productName || !price || !size || !shoeCondition || !boxCondition) {
      setErrorMessage('❌ Please fill in all required fields.');
      return;
    }

    const table = inventoryType === 'new' ? 'new_inventory' : 'used_inventory';

    const product = {
      vendor_id: "1c4f0042-730b-48eb-ab46-83a560bbecea", // 🔥 Temporary
      product_name: productName,
      description,
      price: Number(price),
      quantity: Number(quantity),
      size,
      color,
      barcode,
      shoe_condition: shoeCondition,
      box_condition: boxCondition
    };

    if (inventoryType === 'new') {
      // Check if barcode already exists
      const { data: existing, error: checkError } = await supabase
        .from('new_inventory')
        .select('*')
        .eq('barcode', barcode)
        .maybeSingle();

      if (existing) {
        setErrorMessage('❌ Barcode already exists for a new product!');
        return;
      }
    }

    const { error } = await supabase
      .from(table)
      .insert([product]);

    if (error) {
      console.error('❌ Error saving product:', error);
      setErrorMessage(`❌ Failed to save product: ${error.message}`);
    } else {
      console.log('✅ Product saved to', table);
      setMessage(`✅ Product saved to ${inventoryType === 'new' ? 'New' : 'Used'} Inventory!`);
      resetForm();
    }
  };

  const sizeOptions = [
    "4M/5.5W", "4.5M/6W", "5M/6.5W", "5.5M/7W", "6M/7.5W", "6.5M/8W",
    "7M/8.5W", "7.5M/9W", "8M/9.5W", "8.5M/10W", "9M/10.5W", "9.5M/11W",
    "10M/11.5W", "10.5M/12W", "11M/12.5W", "11.5M/13W", "12M/13.5W",
    "12.5M/14W", "13M/14.5W", "13.5M/15W", "14M/15.5W"
  ];

  const shoeConditionOptions = [
    "New-DS OG ALL", "New-DS OG Most", "New-DS No Accessories",
    "Tried On", "PADS", "Used"
  ];

  const boxConditionOptions = [
    "Good Box", "Aged Box", "Slight Damage", "No Box", "Replica Box", "Replacement Box"
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center' }}>Vendor Dashboard</h1>

      {/* Inventory Type Selection */}
      {!inventoryType && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h3>What would you like to add?</h3>
          <button 
            onClick={() => setInventoryType('new')}
            style={{ marginRight: '1rem', padding: '10px 20px' }}
          >
            Add New Inventory
          </button>
          <button 
            onClick={() => setInventoryType('used')}
            style={{ padding: '10px 20px' }}
          >
            Add Used Inventory
          </button>
        </div>
      )}

      {/* Inventory Form */}
      {inventoryType && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ textAlign: 'center' }}>
            {inventoryType === 'new' ? "New Inventory Form" : "Used Inventory Form"}
          </h3>

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

          <input type="text" placeholder="Barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} required />

          <select value={shoeCondition} onChange={(e) => setShoeCondition(e.target.value)} required>
            <option value="">Select Shoe Condition</option>
            {shoeConditionOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          <select value={boxCondition} onChange={(e) => setBoxCondition(e.target.value)} required>
            <option value="">Select Box Condition</option>
            {boxConditionOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          <div id="scanner" style={{ width: "100%", display: scanning ? "block" : "none", marginBottom: "1rem" }}></div>

          <button type="button" onClick={startScanner} style={{ padding: '10px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {scanning ? "Stop Scanning" : "Scan Barcode"}
          </button>

          <button type="submit" style={{ padding: '10px', backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Save Product
          </button>

          <button type="button" onClick={() => { setInventoryType(null); resetForm(); }} style={{ padding: '10px', backgroundColor: '#aaa', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Back to Inventory Type
          </button>

          {errorMessage && <p style={{ marginTop: '1rem', color: 'red' }}>{errorMessage}</p>}
          {message && <p style={{ marginTop: '1rem', color: message.startsWith('✅') ? 'green' : 'red' }}>{message}</p>}
        </form>
      )}
    </div>
  );
}
