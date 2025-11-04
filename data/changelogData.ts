export const changelogData = [
    { version: '11.0.0', date: 'Current', changes: [
        'Major Feature: Implemented a new "Glassmorphism" UI theme, providing a modern, semi-transparent aesthetic.',
        'Applied frosted-glass effect to all major UI components including panels, cards, modals, and input fields.',
        'The theme utilizes a `backdrop-filter` for a blurred background effect, creating a sense of depth.',
        'Introduced a new dynamic background that is visible through the semi-transparent UI elements.',
        'Enhanced component borders and shadows to create a "floating" glass feel.',
        'Updated all buttons, inputs, and interactive elements with theme-consistent hover and focus states.',
        'Added the new "Glass" theme to the theme switcher in the Settings panel.',
        'Ensured text and icon legibility across all new transparent components.',
    ]},
    { version: '10.8.2', date: 'Previous', changes: [
        'Major Bug Fix: Fixed a critical crash in the Reports view caused by an incorrect Chart.js library setup.',
        'Major Feature: Complete redesign and overhaul of the Reports view into a comprehensive Sales Dashboard.',
        'New: Added date range presets (Today, Last 7 Days, etc.) for quick filtering.',
        'New: Added key performance indicators (KPIs) for new customers.',
        'Enhanced: Combined Sales and Profit into a single dual-axis chart for better trend comparison.',
        'New: Added a detailed, sortable "Product Performance" table showing units sold, revenue, and profit for each item.',
        'New: Added a "Top Customers" panel to identify key buyers in the selected period.',
        'UI/UX: Reorganized the layout for improved clarity and data visualization.',
    ]},
    { version: '10.4.0', date: 'Previous', changes: [
        'Major Feature: Relaunched the Customer Portal with enhanced functionality.',
        'Integrated all customer-facing features into a unified, tab-based portal including Dashboard, Place Order, Order History, Loyalty, and a new Profile section.',
        'New Profile Management: Customers can now view and edit their profile information (email, phone, address).',
        'New Security Feature: Customers can now securely change their own password from their profile page.',
        'New Feature: A "Welcome Panel" now appears on login for all users, displaying the latest app updates and changelog.',
    ]},
    { version: '10.0.0', date: 'Previous', changes: [
        'Major Feature: Implemented a new high-level "Finance Manager" user role.',
        'Created a default Finance Manager account (Username: Finance, Password: test).',
        'Implemented a mandatory password change prompt upon first login for the new role to ensure security.',
        'Developed a dedicated Finance Dashboard focused on financial oversight, collections, and reporting.',
        'Added a detailed, filterable Invoice Management Center for viewing and managing all monthly statements.',
        'Integrated Collection Tools, allowing the Finance Manager to send payment reminders to customers, which generate high-priority notifications on the customer\'s dashboard.',
        'Enabled quick editing of customer contact details directly from the finance dashboard.',
        'Created a Financial Reporting Suite with an Aged Receivables Report and a summary of total outstanding debt.',
        'Added a dedicated "Account Settings" page for the Finance Manager to change their password.'
    ]},
    { version: '9.5.0', date: 'Previous', changes: [
        'Major Feature: Professional Document & Brand Redesign.',
        'Completely redesigned the Invoice, Purchase Order, and Monthly Statement templates to a modern, clean, and professional aesthetic.',
        'Updated the Gift Card design to align with the new branding for a cohesive customer experience.',
        'Enhanced document footers with clear contact information and icons.',
        'Streamlined the application by completely removing the underutilized Chat functionality, simplifying both the admin and customer interfaces.'
    ]},
    { version: '9.0.0', date: 'Previous', changes: [
        'Major Feature: Implemented a Credit Management and Risk Mitigation Module.',
        'Added a configurable `MaximumCreditLimit` to each customer profile (default: MVR 500).',
        'POS system now automatically blocks credit transactions that would exceed a customer\'s limit.',
        'Implemented automatic credit limit increases (10%) for customers with a history of on-time payments.',
        'New daily system check automatically flags monthly statements as "7 Days Overdue".',
        'Introduced an automated "Credit Block" for customers with overdue accounts, preventing new credit sales.',
        'Credit blocks are automatically removed once all overdue payments are settled.',
        'Admins receive dashboard notifications for overdue accounts.',
        'Customers see a prominent "Account Overdue" notice on their portal.',
    ]},
    { version: '8.0.0', date: 'Previous', changes: [
        'Major Feature: Implemented an Automated Monthly Invoicing System.',
        'The app now automatically generates monthly statements for customers with unpaid transactions at the end of each month.',
        'Customers are notified of new statements via a prominent banner on their dashboard.',
        'Generated statements include an itemized list of all transactions for the period, total amount due, and payment instructions.',
        'Admins can view all generated statements in a new "Monthly Statements" tab in the Invoices view.',
        'Admins can mark statements as paid and view/download the generated PDF for their records.',
        'The system caches generated PDFs to improve performance on subsequent views.',
    ]},
    { version: '7.5.1', date: 'Previous', changes: [
        'Major Feature: Comprehensive Chat System overhaul.',
        'Introduced a public "Main Channel" for group announcements and discussions.',
        'Implemented "@" mentions to tag customers in messages, triggering a toast notification for the tagged user.',
        'Added a universal search bar to the admin chat view to filter conversations or start new ones with any customer.',
        'Upgraded the customer chat from a widget to a full-page "Chat" tab for an improved user experience with channel switching.'
    ]},
    { version: '7.0.0', date: 'Previous', changes: [
        'Major Feature: Added Inventory Forecasting to the main dashboard.',
        'The forecast analyzes recent sales data to predict when products will run out of stock.',
        'Added new configuration options in the Settings page to control the forecast lookback period and re-order threshold.',
        'Removed the Keyboard Shortcuts feature and its associated modal.',
        'Added Apache 2.0 License information to the About section in Settings.',
    ]},
    { version: '6.0.0', date: 'Previous', changes: [
        'Major Feature: Implemented a Visual Reporting Dashboard.',
        'Overhauled the Reports view to display interactive, theme-aware charts for better data visualization.',
        'Added a "Sales Over Time" line chart to track revenue trends within the selected date range.',
        'Added a "Top Selling Products" horizontal bar chart to quickly identify the most popular items by quantity sold.',
        'Added a "Sales by Category" doughnut chart to show the breakdown of revenue sources.',
        'All charts are fully responsive and update dynamically when the date filter is changed.',
    ]},
    { version: '5.0.0', date: 'Previous', changes: [
        'Major Feature: Implemented a full Tiered Loyalty Program to enhance customer retention.',
        'Admins can now create and manage loyalty tiers (e.g., Bronze, Silver, Gold) in a new "Loyalty Program" tab within the Customers view.',
        'Each tier can have a minimum point requirement, a unique color, and a point multiplier to reward frequent shoppers.',
        'The point-of-sale system now automatically calculates and awards points based on the customer\'s tier multiplier.',
        'The system automatically promotes customers to a higher tier when they meet the point threshold after a purchase.',
        'Customers now have a dedicated "Loyalty" tab in their portal showing their current tier, point balance, and a progress bar to the next tier.',
    ]},
    { version: '4.5.0', date: 'Previous', changes: [
        'Major Feature: Implemented a full, real-time Live Chat system.',
        'Added a floating chat widget to the Customer Portal for instant communication.',
        'Created a new, dedicated "Chat" view in the Admin dashboard for managing all conversations.',
        'Admin Chat view features a two-pane layout to list conversations and view messages.',
        'Added unread message notifications for both admins (on the nav button) and customers (on the widget).',
        'Chat history is persistent and saved for future reference.',
    ]},
    { version: '4.1.0', date: 'Previous', changes: [
        'Major Security Update: Implemented a new, secure password reset flow.',
        'Customers requesting a password reset now send a notification to the admin dashboard.',
        'Removed insecure behavior of showing or logging passwords.',
        'Added a new "Password Reset Requests" panel to the admin dashboard.',
        'Admins can approve a reset request, which securely clears the customer\'s old password.',
        'Once approved, customers can use the "Register" function with their existing Redbox ID to set a new password, regaining access to their account and history.',
    ]},
    { version: '4.0.0', date: 'Previous', changes: [
        'Major Feature: Customer & Admin Interaction Hub.',
        'New Customer Dashboard view with at-a-glance info.',
        'Added live tracking for pending order status right on the customer dashboard.',
        'Added "Hot Sellers" panel for customers to see popular products.',
        'New feature for customers to formally request new products, with optional image and wholesaler info.',
        'New feature for customers to suggest selling their own products, with wholesale price and image uploads.',
        'Customers can now track the status of all their submitted requests and suggestions.',
        'New "Pending Customer Orders" panel on the main admin dashboard for quick visibility.',
        'New top-level "Requests" view for admins to manage all incoming customer product requests and suggestions.',
        'Admins can review submissions and update their status (Approved, Denied, Contact for Info), which is then visible to the customer.',
    ]},
    { version: '3.3.0', date: 'Previous', changes: [
        'Complete redesign of the Customers tab for a more intuitive and streamlined user experience.',
        'Replaced the two-pane layout with a clean, searchable, and sortable customer table.',
        'Introduced a new, simplified \'Add/Edit Customer\' modal with a modern design and always-visible action buttons to resolve layout issues.',
        'Added customer summary cards to the top of the Customers view for quick insights.',
    ]},
    { version: '3.2.0', date: 'Previous', changes: [
        'Made Redbox ID editable by administrators in the Manage Customers modal.',
        'Added a confirmation prompt when an admin changes a Redbox ID to prevent accidental modification of a customer\'s login credential.',
        'Fixed a minor bug in the Dashboard view\'s "Top Selling Products" calculation that could cause a crash.',
    ]},
    { version: '3.1.0', date: 'Previous', changes: [
        'Overhauled the \'Manage Customers\' modal with a modern, two-pane layout for easier editing and management.',
        'Added new detailed customer fields: Address, Notes, and Tags.',
        'Integrated \'Redbox ID\' system for admins and customer registration (from previous update).',
        'Updated customer registration to link accounts using Redbox ID instead of creating new profiles.',
    ]},
    { version: '3.0.0', date: 'Previous', changes: [
        'Major Feature: Added a separate front-end for customers.',
        'Implemented a universal login system for Admins and Customers.',
        'Admins can now create and manage customer login credentials.',
        'Customers can browse products, place orders, and view their order history.',
        'Added order status tracking (Pending, Out for Delivery, Delivered).',
        'Admins can now change their own password in the Settings view.',
    ]},
    { version: '2.3.0', date: 'Previous', changes: [
        'Added a new "Amoled" theme for pure black backgrounds, ideal for OLED screens.',
    ]},
    { version: '2.2.0', date: 'Previous', changes: [
        'Implemented a new Promotions & Coupon Codes system.',
        'Added a "Promotions" management tab in the Settings view.',
        'Replaced manual discount input in POS with a structured promo code system.',
        'Transactions now store the applied promotion code for tracking.'
    ]},
    { version: '2.1.0', date: 'Previous', changes: [
        'Refined POS view layout for improved usability.',
        'Added a collapsible cart sidebar to maximize product grid space.',
        'Included Quick Action buttons in the cart for applying common discounts.',
    ]},
    { version: '2.0.0', date: 'Previous', changes: [
        'Major architectural overhaul to Redux Toolkit and a simulated backend.',
        'Added offline support with transaction queuing and auto-sync.',
        'Implemented a new Dashboard view as the default landing page.',
        'Added a full Gift Card & Store Credit system.',
        'Implemented End-of-Day (Z-Report) functionality.',
        'Enhanced search with a fuzzy search algorithm.',
        'Added keyboard shortcuts for POS view and a reference modal in Settings.',
        'UI updates are now optimistic for a faster user experience.'
    ]},
    { version: '1.3.0', date: 'Previous', changes: [
        'Added a dedicated Settings page.',
        'Moved theme switcher to the Settings page.',
        'Added app versioning and a changelog modal.',
        'Replaced theme switcher icon in header with a settings gear icon.'
    ]},
    { version: '1.2.1', date: 'Previous', changes: [
        'Added bulk import functionality for Customers and Wholesalers.'
    ]},
    { version: '1.2.0', date: 'Previous', changes: [
        'Added bulk product import via CSV.'
    ]},
    { version: '1.1.0', date: 'Previous', changes: [
        'Implemented a full "Redbox" dark theme.'
    ]},
    { version: '1.0.0', date: 'Previous', changes: [
        'Initial release of the Fridge MV POS application.'
    ]}
];