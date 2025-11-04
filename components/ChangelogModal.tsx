import React from 'react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const changelogData = [
    { version: '9.5.0', date: 'Current', changes: [
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

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
          <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Version History</h3>
          <button onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          {changelogData.map(entry => (
            <div key={entry.version} className="border-b border-[rgb(var(--color-border-subtle))] pb-4 last:border-b-0">
              <h4 className="text-lg font-semibold text-[rgb(var(--color-text-base))]">Version {entry.version}</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-[rgb(var(--color-text-muted))]">
                {entry.changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border))] transition">Close</button>
        </div>
      </div>
    </div>
  );
};