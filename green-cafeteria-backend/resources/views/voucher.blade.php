<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Voucher - {{ $order->voucher_code }}</title>
  <style>
    body { font-family: DejaVu Sans, sans-serif; margin: 20px; }
    h2 { color: green; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
    th { background-color: #d1e7dd; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #555; }
  </style>
</head>
<body>
  <h2>Green Cafeteria 🏪</h2>
  <hr>
  <p><strong>Customer:</strong> {{ $order->customer_name }}</p>
  <p><strong>Payment Method:</strong> {{ $order->payment_method }}</p>
  <p><strong>Voucher Code:</strong> {{ $order->voucher_code }}</p>

  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Qty</th>
        <th>Price (৳)</th>
        <th>Subtotal (৳)</th>
      </tr>
    </thead>
    <tbody>
      @foreach($order->items as $item)
      <tr>
        <td>{{ $item->menuItem->name }}</td>
        <td>{{ $item->quantity }}</td>
        <td>{{ number_format($item->price, 2) }}</td>
        <td>{{ number_format($item->price * $item->quantity, 2) }}</td>
      </tr>
      @endforeach
      <tr>
        <td colspan="3"><strong>Total:</strong></td>
        <td><strong>{{ number_format($order->total_price, 2) }}৳</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>Thank you for dining with Green Cafeteria ❤️</p>
  </div>
</body>
</html>
<script>
  window.onload = function() {
      window.print();
  };
</script>
