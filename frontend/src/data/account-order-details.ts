export const orders = [
  {
    id: 1001,
    date: '2024-01-01',
    status: 'Pending Approval',
    items: [
      { id: 1, slug: 'adas-vehicle-info-dataset', name: 'ADAS Vehicle Info Dataset', image: '/assets/products/adas-1.jpg', price: 29.99, quantity: 1, total: 29.99 }
    ],
    additionalLines: [{ label: 'Shipping', total: 9.99 }],
    quantity: 1,
    subtotal: 29.99,
    total: 39.98,
    paymentMethod: 'Credit Card',
    shippingAddress: { firstName: 'Alex', lastName: 'Smith', country: 'USA', postcode: '10000', city: 'New York', address: '10 Example St', phone: '+1-555-2000', email: 'alex.smith0@example.com' },
    billingAddress: { firstName: 'Alex', lastName: 'Smith', country: 'USA', postcode: '10000', city: 'New York', address: '10 Example St', phone: '+1-555-2000', email: 'alex.smith0@example.com' }
  },
  {
    id: 1002,
    date: '2024-02-02',
    status: 'Approved',
    items: [
      { id: 1, slug: 'telematics-fleet-data', name: 'Telematics Fleet Data', image: '/assets/products/telematics-1.jpg', price: 34.99, quantity: 1, total: 34.99 },
      { id: 2, slug: 'customer-behavior-logs', name: 'Customer Behavior Logs', image: '/assets/products/behavior-1.jpg', price: 34.99, quantity: 2, total: 69.98 }
    ],
    additionalLines: [{ label: 'Shipping', total: 0 }],
    quantity: 3,
    subtotal: 104.97,
    total: 104.97,
    paymentMethod: 'PayPal',
    shippingAddress: { firstName: 'Jamie', lastName: 'Johnson', country: 'Canada', postcode: '10001', city: 'Toronto', address: '11 Example St', phone: '+1-555-2001', email: 'jamie.johnson1@example.com' },
    billingAddress: { firstName: 'Jamie', lastName: 'Johnson', country: 'Canada', postcode: '10001', city: 'Toronto', address: '11 Example St', phone: '+1-555-2001', email: 'jamie.johnson1@example.com' }
  },
  {
    id: 1003,
    date: '2024-03-03',
    status: 'Denied',
    items: [
      { id: 1, slug: 'customer-behavior-logs', name: 'Customer Behavior Logs', image: '/assets/products/behavior-1.jpg', price: 39.99, quantity: 1, total: 39.99 },
      { id: 2, slug: 'sensor-time-series-pack', name: 'Sensor Time Series Pack', image: '/assets/products/sensor-1.jpg', price: 39.99, quantity: 2, total: 79.98 },
      { id: 3, slug: 'traffic-camera-images', name: 'Traffic Camera Images', image: '/assets/products/traffic-1.jpg', price: 39.99, quantity: 3, total: 119.97 }
    ],
    additionalLines: [{ label: 'Shipping', total: 0 }],
    quantity: 6,
    subtotal: 239.94,
    total: 239.94,
    paymentMethod: 'Bank Transfer',
    shippingAddress: { firstName: 'Taylor', lastName: 'Brown', country: 'UK', postcode: '10002', city: 'London', address: '12 Example St', phone: '+1-555-2002', email: 'taylor.brown2@example.com' },
    billingAddress: { firstName: 'Taylor', lastName: 'Brown', country: 'UK', postcode: '10002', city: 'London', address: '12 Example St', phone: '+1-555-2002', email: 'taylor.brown2@example.com' }
  },
  {
    id: 1004,
    date: '2024-04-04',
    status: 'Shipped',
    items: [
      { id: 1, slug: 'sensor-time-series-pack', name: 'Sensor Time Series Pack', image: '/assets/products/sensor-1.jpg', price: 44.99, quantity: 1, total: 44.99 }
    ],
    additionalLines: [{ label: 'Shipping', total: 9.99 }],
    quantity: 1,
    subtotal: 44.99,
    total: 54.98,
    paymentMethod: 'Apple Pay',
    shippingAddress: { firstName: 'Jordan', lastName: 'Taylor', country: 'Germany', postcode: '10003', city: 'Berlin', address: '13 Example St', phone: '+1-555-2003', email: 'jordan.taylor3@example.com' },
    billingAddress: { firstName: 'Jordan', lastName: 'Taylor', country: 'Germany', postcode: '10003', city: 'Berlin', address: '13 Example St', phone: '+1-555-2003', email: 'jordan.taylor3@example.com' }
  },
  {
    id: 1005,
    date: '2024-05-05',
    status: 'Delivered',
    items: [
      { id: 1, slug: 'traffic-camera-images', name: 'Traffic Camera Images', image: '/assets/products/traffic-1.jpg', price: 49.99, quantity: 1, total: 49.99 },
      { id: 2, slug: 'lidar-pointcloud-set', name: 'Lidar Pointcloud Set', image: '/assets/products/lidar-1.jpg', price: 49.99, quantity: 2, total: 99.98 }
    ],
    additionalLines: [{ label: 'Shipping', total: 0 }],
    quantity: 3,
    subtotal: 149.97,
    total: 149.97,
    paymentMethod: 'Google Pay',
    shippingAddress: { firstName: 'Casey', lastName: 'Anderson', country: 'France', postcode: '10004', city: 'Paris', address: '14 Example St', phone: '+1-555-2004', email: 'casey.anderson4@example.com' },
    billingAddress: { firstName: 'Casey', lastName: 'Anderson', country: 'France', postcode: '10004', city: 'Paris', address: '14 Example St', phone: '+1-555-2004', email: 'casey.anderson4@example.com' }
  },
  {
    id: 1006,
    date: '2024-06-06',
    status: 'Cancelled',
    items: [
      { id: 1, slug: 'lidar-pointcloud-set', name: 'Lidar Pointcloud Set', image: '/assets/products/lidar-1.jpg', price: 29.99, quantity: 1, total: 29.99 },
      { id: 2, slug: 'vin-decoding-bundle', name: 'VIN Decoding Bundle', image: '/assets/products/vin-1.jpg', price: 29.99, quantity: 2, total: 59.98 },
      { id: 3, slug: 'maintenance-records', name: 'Maintenance Records', image: '/assets/products/maintenance-1.jpg', price: 29.99, quantity: 3, total: 89.97 }
    ],
    additionalLines: [{ label: 'Shipping', total: 0 }],
    quantity: 6,
    subtotal: 179.94,
    total: 179.94,
    paymentMethod: 'Debit Card',
    shippingAddress: { firstName: 'Riley', lastName: 'Thomas', country: 'Spain', postcode: '10005', city: 'Madrid', address: '15 Example St', phone: '+1-555-2005', email: 'riley.thomas5@example.com' },
    billingAddress: { firstName: 'Riley', lastName: 'Thomas', country: 'Spain', postcode: '10005', city: 'Madrid', address: '15 Example St', phone: '+1-555-2005', email: 'riley.thomas5@example.com' }
  },
  {
    id: 1007,
    date: '2024-07-07',
    status: 'Processing',
    items: [
      { id: 1, slug: 'vin-decoding-bundle', name: 'VIN Decoding Bundle', image: '/assets/products/vin-1.jpg', price: 34.99, quantity: 1, total: 34.99 }
    ],
    additionalLines: [{ label: 'Shipping', total: 9.99 }],
    quantity: 1,
    subtotal: 34.99,
    total: 44.98,
    paymentMethod: 'Invoice',
    shippingAddress: { firstName: 'Morgan', lastName: 'Jackson', country: 'Italy', postcode: '10006', city: 'Milan', address: '16 Example St', phone: '+1-555-2006', email: 'morgan.jackson6@example.com' },
    billingAddress: { firstName: 'Morgan', lastName: 'Jackson', country: 'Italy', postcode: '10006', city: 'Milan', address: '16 Example St', phone: '+1-555-2006', email: 'morgan.jackson6@example.com' }
  },
  {
    id: 1008,
    date: '2024-08-08',
    status: 'On Hold',
    items: [
      { id: 1, slug: 'maintenance-records', name: 'Maintenance Records', image: '/assets/products/maintenance-1.jpg', price: 39.99, quantity: 1, total: 39.99 },
      { id: 2, slug: 'road-sign-annotations', name: 'Road Sign Annotations', image: '/assets/products/roadsign-1.jpg', price: 39.99, quantity: 2, total: 79.98 }
    ],
    additionalLines: [{ label: 'Shipping', total: 0 }],
    quantity: 3,
    subtotal: 119.97,
    total: 119.97,
    paymentMethod: 'Wire Transfer',
    shippingAddress: { firstName: 'Avery', lastName: 'White', country: 'Australia', postcode: '10007', city: 'Sydney', address: '17 Example St', phone: '+1-555-2007', email: 'avery.white7@example.com' },
    billingAddress: { firstName: 'Avery', lastName: 'White', country: 'Australia', postcode: '10007', city: 'Sydney', address: '17 Example St', phone: '+1-555-2007', email: 'avery.white7@example.com' }
  },
  {
    id: 1009,
    date: '2024-09-09',
    status: 'Returned',
    items: [
      { id: 1, slug: 'road-sign-annotations', name: 'Road Sign Annotations', image: '/assets/products/roadsign-1.jpg', price: 44.99, quantity: 1, total: 44.99 },
      { id: 2, slug: 'drive-cycle-profiles', name: 'Drive Cycle Profiles', image: '/assets/products/drive-1.jpg', price: 44.99, quantity: 2, total: 89.98 },
      { id: 3, slug: 'battery-health-metrics', name: 'Battery Health Metrics', image: '/assets/products/battery-1.jpg', price: 44.99, quantity: 3, total: 134.97 }
    ],
    additionalLines: [{ label: 'Shipping', total: 0 }],
    quantity: 6,
    subtotal: 269.94,
    total: 269.94,
    paymentMethod: 'Stripe',
    shippingAddress: { firstName: 'Quinn', lastName: 'Harris', country: 'Netherlands', postcode: '10008', city: 'Amsterdam', address: '18 Example St', phone: '+1-555-2008', email: 'quinn.harris8@example.com' },
    billingAddress: { firstName: 'Quinn', lastName: 'Harris', country: 'Netherlands', postcode: '10008', city: 'Amsterdam', address: '18 Example St', phone: '+1-555-2008', email: 'quinn.harris8@example.com' }
  },
  {
    id: 1010,
    date: '2024-10-10',
    status: 'Refunded',
    items: [
      { id: 1, slug: 'drive-cycle-profiles', name: 'Drive Cycle Profiles', image: '/assets/products/drive-1.jpg', price: 49.99, quantity: 1, total: 49.99 }
    ],
    additionalLines: [{ label: 'Shipping', total: 9.99 }],
    quantity: 1,
    subtotal: 49.99,
    total: 59.98,
    paymentMethod: 'Amazon Pay',
    shippingAddress: { firstName: 'Parker', lastName: 'Martin', country: 'Sweden', postcode: '10009', city: 'Stockholm', address: '19 Example St', phone: '+1-555-2009', email: 'parker.martin9@example.com' },
    billingAddress: { firstName: 'Parker', lastName: 'Martin', country: 'Sweden', postcode: '10009', city: 'Stockholm', address: '19 Example St', phone: '+1-555-2009', email: 'parker.martin9@example.com' }
  },
  {
    id: 1011,
    date: '2024-11-11',
    status: 'Awaiting Payment',
    items: [
      { id: 1, slug: 'battery-health-metrics', name: 'Battery Health Metrics', image: '/assets/products/battery-1.jpg', price: 29.99, quantity: 1, total: 29.99 },
      { id: 2, slug: 'infotainment-usage-stats', name: 'Infotainment Usage Stats', image: '/assets/products/infotainment-1.jpg', price: 29.99, quantity: 2, total: 59.98 }
    ],
    additionalLines: [{ label: 'Shipping', total: 9.99 }],
    quantity: 3,
    subtotal: 89.97,
    total: 99.96,
    paymentMethod: 'Credit Card',
    shippingAddress: { firstName: 'Alex', lastName: 'Smith', country: 'USA', postcode: '10010', city: 'New York', address: '20 Example St', phone: '+1-555-2010', email: 'alex.smith10@example.com' },
    billingAddress: { firstName: 'Alex', lastName: 'Smith', country: 'USA', postcode: '10010', city: 'New York', address: '20 Example St', phone: '+1-555-2010', email: 'alex.smith10@example.com' }
  },
  {
    id: 1012,
    date: '2024-12-12',
    status: 'Partially Shipped',
    items: [
      { id: 1, slug: 'infotainment-usage-stats', name: 'Infotainment Usage Stats', image: '/assets/products/infotainment-1.jpg', price: 34.99, quantity: 1, total: 34.99 },
      { id: 2, slug: 'map-tile-package', name: 'Map Tile Package', image: '/assets/products/map-1.jpg', price: 34.99, quantity: 2, total: 69.98 },
      { id: 3, slug: 'adas-calibration-data', name: 'ADAS Calibration Data', image: '/assets/products/adas-calib-1.jpg', price: 34.99, quantity: 3, total: 104.97 }
    ],
    additionalLines: [{ label: 'Shipping', total: 0 }],
    quantity: 6,
    subtotal: 209.94,
    total: 209.94,
    paymentMethod: 'PayPal',
    shippingAddress: { firstName: 'Jamie', lastName: 'Johnson', country: 'Canada', postcode: '10011', city: 'Toronto', address: '21 Example St', phone: '+1-555-2011', email: 'jamie.johnson11@example.com' },
    billingAddress: { firstName: 'Jamie', lastName: 'Johnson', country: 'Canada', postcode: '10011', city: 'Toronto', address: '21 Example St', phone: '+1-555-2011', email: 'jamie.johnson11@example.com' }
  },
  {
    id: 1013,
    date: '2024-01-13',
    status: 'Completed',
    items: [
      { id: 1, slug: 'map-tile-package', name: 'Map Tile Package', image: '/assets/products/map-1.jpg', price: 39.99, quantity: 1, total: 39.99 }
    ],
    additionalLines: [{ label: 'Shipping', total: 9.99 }],
    quantity: 1,
    subtotal: 39.99,
    total: 49.98,
    paymentMethod: 'Bank Transfer',
    shippingAddress: { firstName: 'Taylor', lastName: 'Brown', country: 'UK', postcode: '10012', city: 'London', address: '22 Example St', phone: '+1-555-2012', email: 'taylor.brown12@example.com' },
    billingAddress: { firstName: 'Taylor', lastName: 'Brown', country: 'UK', postcode: '10012', city: 'London', address: '22 Example St', phone: '+1-555-2012', email: 'taylor.brown12@example.com' }
  },
  {
    id: 1014,
    date: '2024-02-14',
    status: 'In Review',
    items: [
      { id: 1, slug: 'adas-calibration-data', name: 'ADAS Calibration Data', image: '/assets/products/adas-calib-1.jpg', price: 44.99, quantity: 1, total: 44.99 },
      { id: 2, slug: 'lane-marking-vectors', name: 'Lane Marking Vectors', image: '/assets/products/lane-1.jpg', price: 44.99, quantity: 2, total: 89.98 }
    ],
    additionalLines: [{ label: 'Shipping', total: 0 }],
    quantity: 3,
    subtotal: 134.97,
    total: 134.97,
    paymentMethod: 'Apple Pay',
    shippingAddress: { firstName: 'Jordan', lastName: 'Taylor', country: 'Germany', postcode: '10013', city: 'Berlin', address: '23 Example St', phone: '+1-555-2013', email: 'jordan.taylor13@example.com' },
    billingAddress: { firstName: 'Jordan', lastName: 'Taylor', country: 'Germany', postcode: '10013', city: 'Berlin', address: '23 Example St', phone: '+1-555-2013', email: 'jordan.taylor13@example.com' }
  },
  {
    id: 1015,
    date: '2024-03-15',
    status: 'Awaiting Fulfillment',
    items: [
      { id: 1, slug: 'lane-marking-vectors', name: 'Lane Marking Vectors', image: '/assets/products/lane-1.jpg', price: 49.99, quantity: 1, total: 49.99 },
      { id: 2, slug: 'adas-vehicle-info-dataset', name: 'ADAS Vehicle Info Dataset', image: '/assets/products/adas-1.jpg', price: 49.99, quantity: 2, total: 99.98 },
      { id: 3, slug: 'telematics-fleet-data', name: 'Telematics Fleet Data', image: '/assets/products/telematics-1.jpg', price: 49.99, quantity: 3, total: 149.97 }
    ],
    additionalLines: [{ label: 'Shipping', total: 0 }],
    quantity: 6,
    subtotal: 299.94,
    total: 299.94,
    paymentMethod: 'Google Pay',
    shippingAddress: { firstName: 'Casey', lastName: 'Anderson', country: 'France', postcode: '10014', city: 'Paris', address: '24 Example St', phone: '+1-555-2014', email: 'casey.anderson14@example.com' },
    billingAddress: { firstName: 'Casey', lastName: 'Anderson', country: 'France', postcode: '10014', city: 'Paris', address: '24 Example St', phone: '+1-555-2014', email: 'casey.anderson14@example.com' }
  },
  {
    id: 1016,
    date: '2024-04-16',
    status: 'Failed',
    items: [
      { id: 1, slug: 'adas-vehicle-info-dataset', name: 'ADAS Vehicle Info Dataset', image: '/assets/products/adas-1.jpg', price: 29.99, quantity: 1, total: 29.99 }
    ],
    additionalLines: [{ label: 'Shipping', total: 9.99 }],
    quantity: 1,
    subtotal: 29.99,
    total: 39.98,
    paymentMethod: 'Debit Card',
    shippingAddress: { firstName: 'Riley', lastName: 'Thomas', country: 'Spain', postcode: '10015', city: 'Madrid', address: '25 Example St', phone: '+1-555-2015', email: 'riley.thomas15@example.com' },
    billingAddress: { firstName: 'Riley', lastName: 'Thomas', country: 'Spain', postcode: '10015', city: 'Madrid', address: '25 Example St', phone: '+1-555-2015', email: 'riley.thomas15@example.com' }
  },
  {
    id: 1017,
    date: '2024-05-17',
    status: 'Payment Confirmed',
    items: [
      { id: 1, slug: 'telematics-fleet-data', name: 'Telematics Fleet Data', image: '/assets/products/telematics-1.jpg', price: 34.99, quantity: 1, total: 34.99 },
      { id: 2, slug: 'customer-behavior-logs', name: 'Customer Behavior Logs', image: '/assets/products/behavior-1.jpg', price: 34.99, quantity: 2, total: 69.98 }
    ],
    additionalLines: [{ label: 'Shipping', total: 0 }],
    quantity: 3,
    subtotal: 104.97,
    total: 104.97,
    paymentMethod: 'Invoice',
    shippingAddress: { firstName: 'Morgan', lastName: 'Jackson', country: 'Italy', postcode: '10016', city: 'Milan', address: '26 Example St', phone: '+1-555-2016', email: 'morgan.jackson16@example.com' },
    billingAddress: { firstName: 'Morgan', lastName: 'Jackson', country: 'Italy', postcode: '10016', city: 'Milan', address: '26 Example St', phone: '+1-555-2016', email: 'morgan.jackson16@example.com' }
  },
  {
    id: 1018,
    date: '2024-06-18',
    status: 'Scheduled',
    items: [
      { id: 1, slug: 'customer-behavior-logs', name: 'Customer Behavior Logs', image: '/assets/products/behavior-1.jpg', price: 39.99, quantity: 1, total: 39.99 },
      { id: 2, slug: 'sensor-time-series-pack', name: 'Sensor Time Series Pack', image: '/assets/products/sensor-1.jpg', price: 39.99, quantity: 2, total: 79.98 },
      { id: 3, slug: 'traffic-camera-images', name: 'Traffic Camera Images', image: '/assets/products/traffic-1.jpg', price: 39.99, quantity: 3, total: 119.97 }
    ],
    additionalLines: [{ label: 'Shipping', total: 0 }],
    quantity: 6,
    subtotal: 239.94,
    total: 239.94,
    paymentMethod: 'Wire Transfer',
    shippingAddress: { firstName: 'Avery', lastName: 'White', country: 'Australia', postcode: '10017', city: 'Sydney', address: '27 Example St', phone: '+1-555-2017', email: 'avery.white17@example.com' },
    billingAddress: { firstName: 'Avery', lastName: 'White', country: 'Australia', postcode: '10017', city: 'Sydney', address: '27 Example St', phone: '+1-555-2017', email: 'avery.white17@example.com' }
  },
  {
    id: 1019,
    date: '2024-07-19',
    status: 'Disputed',
    items: [
      { id: 1, slug: 'sensor-time-series-pack', name: 'Sensor Time Series Pack', image: '/assets/products/sensor-1.jpg', price: 44.99, quantity: 1, total: 44.99 }
    ],
    additionalLines: [{ label: 'Shipping', total: 9.99 }],
    quantity: 1,
    subtotal: 44.99,
    total: 54.98,
    paymentMethod: 'Stripe',
    shippingAddress: { firstName: 'Quinn', lastName: 'Harris', country: 'Netherlands', postcode: '10018', city: 'Amsterdam', address: '28 Example St', phone: '+1-555-2018', email: 'quinn.harris18@example.com' },
    billingAddress: { firstName: 'Quinn', lastName: 'Harris', country: 'Netherlands', postcode: '10018', city: 'Amsterdam', address: '28 Example St', phone: '+1-555-2018', email: 'quinn.harris18@example.com' }
  },
  {
    id: 1020,
    date: '2024-08-20',
    status: 'Transferred',
    items: [
      { id: 1, slug: 'traffic-camera-images', name: 'Traffic Camera Images', image: '/assets/products/traffic-1.jpg', price: 49.99, quantity: 1, total: 49.99 },
      { id: 2, slug: 'lidar-pointcloud-set', name: 'Lidar Pointcloud Set', image: '/assets/products/lidar-1.jpg', price: 49.99, quantity: 2, total: 99.98 }
    ],
    additionalLines: [{ label: 'Shipping', total: 0 }],
    quantity: 3,
    subtotal: 149.97,
    total: 149.97,
    paymentMethod: 'Amazon Pay',
    shippingAddress: { firstName: 'Parker', lastName: 'Martin', country: 'Sweden', postcode: '10019', city: 'Stockholm', address: '29 Example St', phone: '+1-555-2019', email: 'parker.martin19@example.com' },
    billingAddress: { firstName: 'Parker', lastName: 'Martin', country: 'Sweden', postcode: '10019', city: 'Stockholm', address: '29 Example St', phone: '+1-555-2019', email: 'parker.martin19@example.com' }
  },
  {
    id: 1021,
    date: '2024-09-21',
    status: 'Archived',
    items: [
      { id: 1, slug: 'lidar-pointcloud-set', name: 'Lidar Pointcloud Set', image: '/assets/products/lidar-1.jpg', price: 29.99, quantity: 1, total: 29.99 },
      { id: 2, slug: 'vin-decoding-bundle', name: 'VIN Decoding Bundle', image: '/assets/products/vin-1.jpg', price: 29.99, quantity: 2, total: 59.98 },
      { id: 3, slug: 'maintenance-records', name: 'Maintenance Records', image: '/assets/products/maintenance-1.jpg', price: 29.99, quantity: 3, total: 89.97 }
    ],
    additionalLines: [{ label: 'Shipping', total: 0 }],
    quantity: 6,
    subtotal: 179.94,
    total: 179.94,
    paymentMethod: 'Credit Card',
    shippingAddress: { firstName: 'Alex', lastName: 'Smith', country: 'USA', postcode: '10020', city: 'New York', address: '30 Example St', phone: '+1-555-2020', email: 'alex.smith20@example.com' },
    billingAddress: { firstName: 'Alex', lastName: 'Smith', country: 'USA', postcode: '10020', city: 'New York', address: '30 Example St', phone: '+1-555-2020', email: 'alex.smith20@example.com' }
  },
  {
    id: 1022,
    date: '2024-10-22',
    status: 'Draft',
    items: [
      { id: 1, slug: 'vin-decoding-bundle', name: 'VIN Decoding Bundle', image: '/assets/products/vin-1.jpg', price: 34.99, quantity: 1, total: 34.99 }
    ],
    additionalLines: [{ label: 'Shipping', total: 9.99 }],
    quantity: 1,
    subtotal: 34.99,
    total: 44.98,
    paymentMethod: 'PayPal',
    shippingAddress: { firstName: 'Jamie', lastName: 'Johnson', country: 'Canada', postcode: '10021', city: 'Toronto', address: '31 Example St', phone: '+1-555-2021', email: 'jamie.johnson21@example.com' },
    billingAddress: { firstName: 'Jamie', lastName: 'Johnson', country: 'Canada', postcode: '10021', city: 'Toronto', address: '31 Example St', phone: '+1-555-2021', email: 'jamie.johnson21@example.com' }
  },
  {
    id: 1023,
    date: '2024-11-23',
    status: 'Awaiting Pickup',
    items: [
      { id: 1, slug: 'maintenance-records', name: 'Maintenance Records', image: '/assets/products/maintenance-1.jpg', price: 39.99, quantity: 1, total: 39.99 },
      { id: 2, slug: 'road-sign-annotations', name: 'Road Sign Annotations', image: '/assets/products/roadsign-1.jpg', price: 39.99, quantity: 2, total: 79.98 }
    ],
    additionalLines: [{ label: 'Shipping', total: 0 }],
    quantity: 3,
    subtotal: 119.97,
    total: 119.97,
    paymentMethod: 'Bank Transfer',
    shippingAddress: { firstName: 'Taylor', lastName: 'Brown', country: 'UK', postcode: '10022', city: 'London', address: '32 Example St', phone: '+1-555-2022', email: 'taylor.brown22@example.com' },
    billingAddress: { firstName: 'Taylor', lastName: 'Brown', country: 'UK', postcode: '10022', city: 'London', address: '32 Example St', phone: '+1-555-2022', email: 'taylor.brown22@example.com' }
  },
  {
    id: 1024,
    date: '2024-12-24',
    status: 'Ready for Dispatch',
    items: [
      { id: 1, slug: 'road-sign-annotations', name: 'Road Sign Annotations', image: '/assets/products/roadsign-1.jpg', price: 44.99, quantity: 1, total: 44.99 },
      { id: 2, slug: 'drive-cycle-profiles', name: 'Drive Cycle Profiles', image: '/assets/products/drive-1.jpg', price: 44.99, quantity: 2, total: 89.98 },
      { id: 3, slug: 'battery-health-metrics', name: 'Battery Health Metrics', image: '/assets/products/battery-1.jpg', price: 44.99, quantity: 3, total: 134.97 }
    ],
    additionalLines: [{ label: 'Shipping', total: 0 }],
    quantity: 6,
    subtotal: 269.94,
    total: 269.94,
    paymentMethod: 'Apple Pay',
    shippingAddress: { firstName: 'Jordan', lastName: 'Taylor', country: 'Germany', postcode: '10023', city: 'Berlin', address: '33 Example St', phone: '+1-555-2023', email: 'jordan.taylor23@example.com' },
    billingAddress: { firstName: 'Jordan', lastName: 'Taylor', country: 'Germany', postcode: '10023', city: 'Berlin', address: '33 Example St', phone: '+1-555-2023', email: 'jordan.taylor23@example.com' }
  },
  {
    id: 1025,
    date: '2024-01-25',
    status: 'Quality Check',
    items: [
      { id: 1, slug: 'drive-cycle-profiles', name: 'Drive Cycle Profiles', image: '/assets/products/drive-1.jpg', price: 49.99, quantity: 1, total: 49.99 }
    ],
    additionalLines: [{ label: 'Shipping', total: 9.99 }],
    quantity: 1,
    subtotal: 49.99,
    total: 59.98,
    paymentMethod: 'Google Pay',
    shippingAddress: { firstName: 'Casey', lastName: 'Anderson', country: 'France', postcode: '10024', city: 'Paris', address: '34 Example St', phone: '+1-555-2024', email: 'casey.anderson24@example.com' },
    billingAddress: { firstName: 'Casey', lastName: 'Anderson', country: 'France', postcode: '10024', city: 'Paris', address: '34 Example St', phone: '+1-555-2024', email: 'casey.anderson24@example.com' }
  }
];

export const order = orders[0];