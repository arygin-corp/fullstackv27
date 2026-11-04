const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const EXPECTED_BASIC = 'Basic PLACEHOLDER_BASE64';

app.post('/submitOrder', (req, res) => {
  const auth = req.header('Authorization') || '';
  if (!auth || auth !== EXPECTED_BASIC) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const payload = req.body || {};
  const variables = payload.variables || {};
  const cartItems = variables.cart_items || [];
  const darRequests = variables.dar_requests || [];

  const orderNumber = 'REQ-' + Date.now().toString().slice(-8);

  const responseBody = {
    result: {
      number: orderNumber,
      submittedAt: new Date().toISOString(),
      cartItemsCount: cartItems.length,
      darRequestsCount: darRequests.length
    }
  };

  console.log('Received submitOrder:', {
    path: req.path,
    auth,
    sysparm_quantity: payload.sysparm_quantity,
    v_dar_objectid_createdby: variables.v_dar_objectid_createdby,
    cartItemsSummary: cartItems.map((c) => ({ formDataPresent: !!c.formData })),
    darRequestsSummary: darRequests.map((d) => ({ formDataPresent: !!d.formData }))
  });

  setTimeout(() => {
    res.status(200).json(responseBody);
  }, 1500);
});

app.listen(PORT, () => {
  console.log(`Mock ServiceNow running on http://localhost:${PORT}`);
});