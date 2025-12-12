// src/pages/BookingCart.jsx

import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../Store/cartSlice';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';

// ❌ removed DEFAULT_OWNER_ID

const BookingCart = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const user = useSelector((state) => state.users.user);
  const dispatch = useDispatch();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // 🔹 Payment fields (demo only – just saved to DB)
  const [cardNumber, setCardNumber] = useState('');
  const [walletNumber, setWalletNumber] = useState('');

  // Extra visual-only card form fields
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [nickname, setNickname] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // Support both old rental labels and new hotel labels
  const getDaysFromDuration = (duration) => {
    if (duration === '1 Day' || duration === '1 Night') return 1;
    if (duration === '2 Nights') return 2;
    if (duration === '3 Days' || duration === '3 Nights') return 3;
    if (duration === '1 Week') return 7;
    return 1;
  };

  // Normalize unit price
  const getUnitPrice = (item) => {
    // old cart: price; new rooms: nightlyRate
    return item.price ?? item.nightlyRate ?? 0;
  };

  const getDurationLabel = (item) => {
    // new booking naming: stayDuration; old: rentalDuration
    return item.stayDuration || item.rentalDuration || '1 Night';
  };

  const getStayDates = (item) => {
    const from = item.checkInDate || item.fromDate || null;
    const to = item.checkOutDate || item.toDate || null;
    return { from, to };
  };

  const calculateTotal = (item) => {
    const unitPrice = getUnitPrice(item);
    const { from, to } = getStayDates(item);

    if (from && to) {
      const start = new Date(from);
      const end = new Date(to);
      const msPerDay = 1000 * 60 * 60 * 24;
      const diff = Math.round((end - start) / msPerDay);
      const nights = diff > 0 ? diff : 1;
      return unitPrice * nights;
    }

    return unitPrice * getDaysFromDuration(getDurationLabel(item));
  };

  // Overall cart totals
  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + calculateTotal(item),
        0
      ),
    [cartItems]
  );

  const handleCheckout = (item) => {
    if (!user?._id) {
      Swal.fire({
        icon: 'info',
        title: 'Please log in',
        text: 'You need to be logged in to confirm a booking.',
        confirmButtonColor: '#0A3D91',
      });
      return;
    }
    setSelectedItem(item);
    setShowSummary(true);
  };

  const handleProceed = () => {
    // reset payment inputs whenever we open payment step
    setCardNumber('');
    setWalletNumber('');
    setCardHolder('');
    setExpiry('');
    setCvv('');
    setNickname('');
    setSaveCard(true);

    setShowSummary(false);
    setShowPayment(true);
  };

  const handleDeleteItem = (itemId) => {
    Swal.fire({
      title: 'Remove this room?',
      text: 'You are removing this room from your booking list.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0A3D91',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Yes, remove it',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removeFromCart(itemId));
        Swal.fire('Removed', 'Room has been removed from your list.', 'success');
      }
    });
  };

  const handleClearCart = () => {
    if (!cartItems.length) return;
    Swal.fire({
      title: 'Clear all selected rooms?',
      text: 'This will remove all rooms from your booking list.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0A3D91',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Yes, clear it',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(clearCart());
        Swal.fire('Cleared', 'Your booking list is now empty.', 'success');
      }
    });
  };

  /* ======================
     CARD INPUT HANDLERS (VALIDATION + FORMATTING)
     ====================== */

  // Name: only chars & spaces
  const handleCardHolderChange = (e) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/[^a-zA-Z\s]/g, ''); // remove digits & symbols
    setCardHolder(cleaned);
  };

  // Card number: digits only, max 16, auto "0000-0000-0000-0000"
  const handleCardNumberChange = (e) => {
    let value = e.target.value || '';

    // keep digits only
    let digits = value.replace(/\D/g, '');
    // max 16 digits
    digits = digits.slice(0, 16);

    // group into 4s with "-"
    const groups = digits.match(/.{1,4}/g) || [];
    const formatted = groups.join('-');

    setCardNumber(formatted);
  };

  // Expiry: auto format to "MM / YY"
  const handleExpiryChange = (e) => {
    let value = e.target.value || '';
    let digits = value.replace(/\D/g, ''); // only numbers
    digits = digits.slice(0, 4); // MMYY max

    if (digits.length <= 2) {
      // just month typing (e.g. "0", "05")
      setExpiry(digits);
    } else {
      const mm = digits.slice(0, 2);
      const yy = digits.slice(2, 4);
      setExpiry(`${mm} / ${yy}`);
    }
  };

  // CVV: digits, max 3
  const handleCvvChange = (e) => {
    let value = e.target.value || '';
    let digits = value.replace(/\D/g, '');
    digits = digits.slice(0, 3);
    setCvv(digits);
  };

  const handleConfirmRental = async () => {
    if (!selectedItem) return;

    if (!user?._id) {
      Swal.fire({
        icon: 'info',
        title: 'Please log in',
        text: 'You need to be logged in to confirm a booking.',
        confirmButtonColor: '#0A3D91',
      });
      return;
    }

    // 🔐 Simple check: at least one payment field must be filled
    if (!cardNumber.trim() && !walletNumber.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Payment details required',
        text: 'Please enter a card number or an online wallet number.',
        confirmButtonColor: '#0A3D91',
      });
      return;
    }

    // 🔐 If card number is entered, validate card details strictly
    if (cardNumber.trim()) {
      const digitsOnlyCard = cardNumber.replace(/\D/g, '');

      if (!cardHolder.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Card holder name required',
          text: 'Please enter the name on the card (letters only).',
          confirmButtonColor: '#0A3D91',
        });
        return;
      }

      if (digitsOnlyCard.length !== 16) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid card number',
          text: 'Card number must be 16 digits.',
          confirmButtonColor: '#0A3D91',
        });
        return;
      }

      const expiryDigits = expiry.replace(/\D/g, '');
      if (expiryDigits.length !== 4) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid expiry date',
          text: 'Expiry must be in MM / YY format.',
          confirmButtonColor: '#0A3D91',
        });
        return;
      }

      const month = parseInt(expiryDigits.slice(0, 2), 10);
      if (Number.isNaN(month) || month < 1 || month > 12) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid expiry month',
          text: 'Please enter a valid month between 01 and 12.',
          confirmButtonColor: '#0A3D91',
        });
        return;
      }

      if (cvv.length !== 3) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid CVV',
          text: 'CVV must be exactly 3 digits.',
          confirmButtonColor: '#0A3D91',
        });
        return;
      }
    }

    const totalCost = Number(calculateTotal(selectedItem).toFixed(2));

    const roomNameFromItem =
      selectedItem.roomName ||
      selectedItem.title ||
      selectedItem.name ||
      'Unnamed room';

    const imageFromItem =
      selectedItem.image ||
      selectedItem.photo ||
      'no-image.jpg';

    const { from: fromDate, to: toDate } = getStayDates(selectedItem);
    const guestCount =
      selectedItem.guestCount ||
      selectedItem.noOfPersons ||
      selectedItem.numGuests ||
      1;

    const payload = {
      roomId:
        selectedItem.roomId ||
        selectedItem.equipmentId ||
        selectedItem._id,

      roomName: roomNameFromItem,
      image: imageFromItem,

      // ✅ use item owner/manager if present, otherwise logged-in user
      ownerId:
        selectedItem.ownerId ||
        selectedItem.managerId ||
        user._id,

      customerId: user._id,

      stayDuration: getDurationLabel(selectedItem),

      totalCost,

      checkInDate: fromDate,
      checkOutDate: toDate,
      guestCount,

      // 🔹 send ONLY these payment details to backend
      cardNumber: cardNumber.trim() || null,
      walletNumber: walletNumber.trim() || null,
    };

    if (
      !payload.roomId ||
      !payload.ownerId ||
      !payload.customerId ||
      !payload.stayDuration ||
      !payload.totalCost ||
      !payload.roomName ||
      !payload.image ||
      !payload.checkInDate ||
      !payload.checkOutDate ||
      !payload.guestCount
    ) {
      Swal.fire(
        'Error',
        'Some booking details are missing. Please go back and select your dates and number of guests.',
        'error'
      );
      return;
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/bookings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      let data = {};
      try {
        data = await res.json();
      } catch (e) {}

      if (res.ok) {
        const keyToRemove =
          selectedItem.equipmentId ||
          selectedItem.roomId ||
          selectedItem._id;

        dispatch(removeFromCart(keyToRemove));
        setShowPayment(false);
        setShowThankYou(true);
      } else {
        Swal.fire(
          'Error',
          data?.message || 'Failed to confirm booking. Please try again.',
          'error'
        );
      }
    } catch (error) {
      Swal.fire(
        'Error',
        'Failed to confirm booking. Please try again.',
        'error'
      );
    }
  };

  // helper for invoice view
  const formatOMR = (amount) =>
    `OMR ${Number(amount || 0).toFixed(3)}`;

  const todayStr = new Date().toLocaleDateString();

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        {/* Top band */}
        <div style={styles.band}>
          <div style={styles.bandInner}>
            <div>
              <p style={styles.stepLabel}>Step 2 of 3</p>
              <h2 style={styles.bandHeading}>Review your stay plan</h2>
              <p style={styles.bandText}>
                Confirm the rooms you’ve selected before you finalise your reservation.
              </p>
            </div>
            {cartItems.length > 0 && (
              <div style={styles.bandTotalsBox}>
                <div style={styles.bandTotalsLabel}>Current total</div>
                <div style={styles.bandTotalsAmount}>
                  OMR {cartSubtotal.toFixed(2)}
                </div>
                <div style={styles.bandTotalsHint}>
                  Amount due at check-in. Taxes & fees included.
                </div>
              </div>
            )}
          </div>
        </div>

        <main style={styles.wrapper}>
          <div style={styles.mainGrid}>
            {/* LEFT: Items */}
            <section style={styles.listPanel}>
              <div style={styles.listHeader}>
                <div>
                  <h3 style={styles.sectionTitle}>Selected rooms</h3>
                  <p style={styles.sectionSub}>
                    You can remove or adjust any room before confirming.
                  </p>
                </div>
                {cartItems.length > 0 && (
                  <button style={styles.clearBtn} onClick={handleClearCart}>
                    Clear all
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div style={styles.emptyBox}>
                  <p style={styles.emptyIcon}>🛏️</p>
                  <p style={styles.emptyTitle}>No rooms selected</p>
                  <p style={styles.emptyText}>
                    Browse available rooms and add them to your stay plan.
                  </p>
                  <button
                    style={styles.backBtn}
                    onClick={() => (window.location.href = '/home')}
                  >
                    ← Back to rooms
                  </button>
                </div>
              ) : (
                cartItems.map((item, index) => {
                  const { from, to } = getStayDates(item);
                  const guestCount =
                    item.guestCount ||
                    item.noOfPersons ||
                    item.numGuests ||
                    null;

                  return (
                    <div
                      key={item.equipmentId || item.roomId || item._id || index}
                      style={styles.itemRow}
                    >
                      <div style={styles.thumbWrap}>
                        <img
                          src={`${process.env.REACT_APP_SERVER_URL}/assets/images/${item.image || item.photo}`}
                          alt={item.title || item.name}
                          style={styles.thumb}
                        />
                        <span style={styles.roomBadge}>
                          Room {index + 1}
                        </span>
                      </div>
                      <div style={styles.itemInfo}>
                        <div style={styles.itemHeader}>
                          <div>
                            <h3 style={styles.itemTitle}>{item.title || item.name}</h3>
                            <div style={styles.itemMeta}>
                              <span style={styles.badge}>
                                {getDurationLabel(item) || 'Stay duration not set'}
                              </span>
                              {from && to && (
                                <div style={styles.itemDates}>
                                  <span style={styles.itemDatesLabel}>Dates:</span>{' '}
                                  <span>{from} → {to}</span>
                                </div>
                              )}
                              {guestCount && (
                                <div style={styles.itemDates}>
                                  <span style={styles.itemDatesLabel}>Guests:</span>{' '}
                                  <span>{guestCount}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={styles.itemPriceBlock}>
                            <div style={styles.itemPriceLabel}>Total for this room</div>
                            <div style={styles.itemPrice}>
                              OMR {calculateTotal(item).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div style={styles.rowActions}>
                          <button
                            style={styles.checkoutBtn}
                            onClick={() => handleCheckout(item)}
                          >
                            Review this room
                          </button>
                          <button
                            style={styles.removeBtn}
                            onClick={() =>
                              handleDeleteItem(
                                item.equipmentId || item.roomId || item._id
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </section>

            {/* RIGHT: Summary */}
            <aside style={styles.summarySide}>
              <div style={styles.summaryCard}>
                <h3 style={styles.summaryTitle}>Reservation overview</h3>

                <div style={styles.summaryRow}>
                  <span>Rooms selected</span>
                  <span>{cartItems.length}</span>
                </div>

                <div style={styles.summaryRow}>
                  <span>Room charges</span>
                  <strong>OMR {cartSubtotal.toFixed(2)}</strong>
                </div>

                <div style={styles.summaryRow}>
                  <span>Taxes & fees</span>
                  <span>Included</span>
                </div>

                <div style={{ ...styles.summaryRow, ...styles.summaryTotalRow }}>
                  <span>Amount due at check-in</span>
                  <strong>OMR {cartSubtotal.toFixed(2)}</strong>
                </div>

                <button
                  style={styles.summaryPrimaryBtn}
                  onClick={() => {
                    if (!cartItems.length) return;
                    if (!selectedItem) {
                      setSelectedItem(cartItems[0]);
                      setShowSummary(true);
                    } else {
                      setShowSummary(true);
                    }
                  }}
                >
                  Continue to confirmation
                </button>

                <button
                  style={styles.summarySecondaryBtn}
                  onClick={() => (window.location.href = '/home')}
                >
                  ← Modify room selection
                </button>
              </div>
            </aside>
          </div>
        </main>

        {/* === Summary Modal === */}
        {showSummary && selectedItem && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Room summary</h3>
                <button
                  style={styles.modalClose}
                  onClick={() => setShowSummary(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <p style={styles.modalText}>
                <strong>{selectedItem.title || selectedItem.name}</strong>
              </p>
              <p style={styles.modalText}>
                Stay:{' '}
                <span style={styles.modalChip}>{getDurationLabel(selectedItem)}</span>
              </p>

              {(() => {
                const { from, to } = getStayDates(selectedItem);
                if (!from || !to) return null;
                return (
                  <p style={styles.modalText}>
                    Dates:{' '}
                    <span style={styles.modalChip}>
                      {from} → {to}
                    </span>
                  </p>
                );
              })()}

              {selectedItem.guestCount && (
                <p style={styles.modalText}>
                  Guests:{' '}
                  <span style={styles.modalChip}>
                    {selectedItem.guestCount}
                  </span>
                </p>
              )}

              <p style={styles.modalText}>
                Total:{' '}
                <strong>OMR {calculateTotal(selectedItem).toFixed(2)}</strong>
              </p>

              <button style={styles.modalPrimaryBtn} onClick={handleProceed}>
                Looks good – next
              </button>
            </div>
          </div>
        )}

        {/* === Payment Modal with card-form design === */}
        {showPayment && selectedItem && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Confirm booking & payment</h3>
                <button
                  style={styles.modalClose}
                  onClick={() => setShowPayment(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* Room summary line */}
              {(() => {
                const { from, to } = getStayDates(selectedItem);
                const guests =
                  selectedItem.guestCount ||
                  selectedItem.noOfPersons ||
                  selectedItem.numGuests ||
                  null;

                return (
                  <>
                    <p style={styles.modalText}>
                      {(selectedItem.title || selectedItem.name)} – {getDurationLabel(selectedItem)}
                    </p>
                    {from && to && (
                      <p style={styles.modalText}>
                        <strong>Dates:</strong> {from} → {to}
                      </p>
                    )}
                    {guests && (
                      <p style={styles.modalText}>
                        <strong>Guests:</strong> {guests}
                      </p>
                    )}
                  </>
                );
              })()}

              <p style={styles.modalText}>
                <strong>Payment method:</strong> Pay at hotel
              </p>
              <p style={styles.modalText}>
                We only store your card number or online wallet number for this reservation record.
                No real online payment is processed.
              </p>

              {/* 🔹 Card form styled like your HTML example */}
              <div style={styles.cardForm}>
                {/* Card holder */}
                <div style={styles.cardField}>
                  <label style={styles.cardLabel}>Card holder name</label>
                  <input
                    type="text"
                    style={styles.cardInput}
                    placeholder="Name on card"
                    value={cardHolder}
                    onChange={handleCardHolderChange}
                  />
                </div>

                {/* Card number row */}
                <div style={styles.cardField}>
                  <label style={styles.cardLabel}>Card number</label>
                  <div style={styles.cardNumberRow}>
                    <input
                      type="tel"
                      style={styles.cardInput}
                      placeholder="1234-5678-9101-1121"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19} // 16 digits + 3 dashes
                    />
                  </div>
                </div>

                {/* Expiry + CVV */}
                <div style={styles.cardRow}>
                  <div style={styles.cardField}>
                    <label style={styles.cardLabel}>Expiry date</label>
                    <input
                      type="text"
                      style={styles.cardInput}
                      placeholder="MM / YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      maxLength={7} // "MM / YY"
                    />
                  </div>
                  <div style={styles.cardField}>
                    <label style={styles.cardLabel}>
                      CVV
                    </label>
                    <input
                      type="text"
                      style={styles.cardInput}
                      placeholder="CVV"
                      value={cvv}
                      onChange={handleCvvChange}
                      maxLength={3}
                    />
                  </div>
                </div>

                {/* Online wallet field (for your backend) */}
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>Online wallet number (optional)</label>
                  <input
                    type="text"
                    style={styles.modalInput}
                    placeholder="e.g. Wallet / Pay ID"
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                  />
                </div>
              </div>

              <p style={styles.modalText}>
                <strong>Total amount:</strong> OMR {calculateTotal(selectedItem).toFixed(2)}
              </p>

              <button style={styles.payBtn} onClick={handleConfirmRental}>
                Pay {calculateTotal(selectedItem).toFixed(3)} OMR
              </button>

              <button
                type="button"
                style={styles.cancelLink}
                onClick={() => setShowPayment(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* === Thank You / Invoice Modal === */}
        {showThankYou && selectedItem && (
          <div style={styles.modalOverlay}>
            <div style={styles.invoiceCard}>
              {/* Header */}
              <div style={styles.invoiceHeaderRow}>
                <div>
                  <h2 style={styles.invoiceTitle}>Hotel Mate <span style={{ color: '#000' }}>Stay</span></h2>
                  <div style={styles.invoiceMuted}>
                    INVOICE<br />
                    {/* simple fake number */}
                    #{(selectedItem._id || 'HM-BOOK').toString().slice(-6)}
                  </div>
                </div>
                <div style={styles.invoiceMuted}>
                  DATE<br />
                  {todayStr}
                </div>
              </div>

              {/* Table */}
              <table style={styles.invoiceTable}>
                <thead>
                  <tr>
                    <th style={styles.invoiceTh}>DESCRIPTION</th>
                    <th style={{ ...styles.invoiceTh, ...styles.invoiceRight }}>PRICE</th>
                    <th style={{ ...styles.invoiceTh, ...styles.invoiceRight }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const { from, to } = getStayDates(selectedItem);
                    const guests =
                      selectedItem.guestCount ||
                      selectedItem.noOfPersons ||
                      selectedItem.numGuests ||
                      null;

                    const unit = getUnitPrice(selectedItem);
                    const total = calculateTotal(selectedItem);

                    return (
                      <tr>
                        <td style={styles.invoiceTd}>
                          <strong>{selectedItem.title || selectedItem.name}</strong><br />
                          <span style={styles.invoiceMuted}>
                            Stay: {from && to ? `${from} → ${to}` : getDurationLabel(selectedItem)}
                            {guests ? ` · Guests: ${guests}` : ''}
                          </span>
                        </td>
                        <td style={{ ...styles.invoiceTd, ...styles.invoiceRight }}>
                          {formatOMR(unit)}
                        </td>
                        <td style={{ ...styles.invoiceTd, ...styles.invoiceRight }}>
                          {formatOMR(total)}
                        </td>
                      </tr>
                    );
                  })()}

                  {/* Subtotal */}
                  <tr>
                    <td style={styles.invoiceTd} />
                    <td style={{ ...styles.invoiceTd, ...styles.invoiceRight, fontWeight: 600 }}>
                      SUBTOTAL
                    </td>
                    <td style={{ ...styles.invoiceTd, ...styles.invoiceRight, fontWeight: 600 }}>
                      {formatOMR(calculateTotal(selectedItem))}
                    </td>
                  </tr>

                  {/* Taxes (0 for now) */}
                  <tr>
                    <td style={styles.invoiceTd} />
                    <td style={{ ...styles.invoiceTd, ...styles.invoiceRight, fontWeight: 600 }}>
                      TAXES
                    </td>
                    <td style={{ ...styles.invoiceTd, ...styles.invoiceRight, fontWeight: 600 }}>
                      {formatOMR(0)}
                    </td>
                  </tr>

                  {/* Grand total */}
                  <tr>
                    <td style={styles.invoiceTd} />
                    <td style={{ ...styles.invoiceTd, ...styles.invoiceRight, fontWeight: 800, fontSize: 16 }}>
                      GRAND TOTAL
                    </td>
                    <td style={{ ...styles.invoiceTd, ...styles.invoiceRight, fontWeight: 800, fontSize: 16 }}>
                      {formatOMR(calculateTotal(selectedItem))}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Bank / payment note */}
              <div style={styles.invoiceSectionTitle}>PAYMENT AT HOTEL</div>
              <div style={styles.invoiceMuted}>
                Please present this invoice at check-in. Payment is due in OMR on arrival.
              </div>

              <div style={styles.invoiceSectionTitle}>TERMS &amp; CONDITIONS</div>
              <div style={styles.invoiceMuted}>
                This reservation is held for your selected dates only. Changes or cancellations
                depend on hotel policy. No online charges have been taken for this booking.
              </div>

              <button
                style={styles.thankYouBtn}
                onClick={() => {
                  setShowThankYou(false);
                  setSelectedItem(null);
                  window.location.href = '/home';
                }}
              >
                Back to rooms
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

/* ======================
   STYLES – HOTEL MATE THEME (BLUE & WHITE)
   ====================== */

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#E8F1FF',
    backgroundImage:
      'radial-gradient(circle at top left, rgba(37,99,235,0.16), transparent 55%), ' +
      'radial-gradient(circle at bottom right, rgba(59,130,246,0.18), transparent 55%)',
    color: '#0B1A33',
  },

  band: {
    padding: '22px 16px 24px',
  },

  bandInner: {
    maxWidth: '1140px',
    margin: '0 auto',
    borderRadius: '24px',
    padding: '18px 22px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '18px',
    flexWrap: 'wrap',
    border: '1px solid rgba(148,163,184,0.45)',
    backgroundImage:
      'radial-gradient(circle at top left, rgba(191,219,254,0.9), transparent 70%), ' +
      'radial-gradient(circle at bottom right, rgba(219,234,254,0.9), transparent 70%), ' +
      'linear-gradient(135deg, #FFFFFF, #EFF6FF)',
    boxShadow: '0 18px 45px rgba(15,23,42,0.12)',
  },

  stepLabel: {
    margin: 0,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#1D4ED8',
  },

  bandHeading: {
    margin: '4px 0 4px',
    fontSize: '22px',
    fontWeight: 800,
    color: '#0B1A33',
  },

  bandText: {
    margin: 0,
    fontSize: '13px',
    color: '#374151',
  },

  bandTotalsBox: {
    padding: '10px 14px',
    borderRadius: '16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(191,219,254,0.95)',
    minWidth: '220px',
    boxShadow: '0 12px 28px rgba(15,23,42,0.12)',
  },

  bandTotalsLabel: {
    fontSize: '11px',
    color: '#6B7280',
    marginBottom: '4px',
  },

  bandTotalsAmount: {
    fontSize: '18px',
    fontWeight: 800,
    color: '#0A3D91',
  },

  bandTotalsHint: {
    marginTop: '4px',
    fontSize: '11px',
    color: '#4B5563',
  },

  wrapper: {
    maxWidth: '1140px',
    margin: '0 auto',
    padding: '22px 20px 36px',
  },

  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 2.1fr) minmax(260px, 0.9fr)',
    gap: '20px',
  },

  listPanel: {
    borderRadius: '20px',
    padding: '16px 14px 14px',
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(209,213,219,0.9)',
    boxShadow: '0 18px 40px rgba(15,23,42,0.08)',
  },

  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '10px',
    alignItems: 'center',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 800,
    color: '#0B1A33',
  },

  sectionSub: {
    margin: '2px 0 0',
    fontSize: '12px',
    color: '#4B5563',
  },

  clearBtn: {
    padding: '6px 12px',
    borderRadius: '999px',
    border: '1px solid #FCA5A5',
    backgroundColor: '#FEF2F2',
    color: '#B91C1C',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
  },

  itemRow: {
    display: 'flex',
    gap: '14px',
    padding: '12px 10px',
    borderRadius: '16px',
    backgroundColor: '#F9FAFB',
    border: '1px solid rgba(209,213,219,0.9)',
    marginTop: '10px',
  },

  thumbWrap: {
    flex: '0 0 86px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'center',
  },

  thumb: {
    width: '86px',
    height: '86px',
    borderRadius: '12px',
    objectFit: 'cover',
    border: '1px solid rgba(209,213,219,0.9)',
    backgroundColor: '#E5E7EB',
  },

  roomBadge: {
    fontSize: '11px',
    padding: '3px 9px',
    borderRadius: '999px',
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    fontWeight: 600,
  },

  itemInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },

  itemTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 700,
    color: '#0B1A33',
  },

  itemMeta: {
    marginTop: '4px',
  },

  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '999px',
    fontSize: '11px',
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    fontWeight: 600,
  },

  itemDates: {
    marginTop: '4px',
    fontSize: '11px',
    color: '#4B5563',
  },

  itemDatesLabel: {
    fontWeight: 600,
  },

  itemPriceBlock: {
    textAlign: 'right',
    minWidth: '130px',
  },

  itemPriceLabel: {
    fontSize: '11px',
    color: '#6B7280',
    marginBottom: '2px',
  },

  itemPrice: {
    fontSize: '14px',
    fontWeight: 800,
    color: '#0B1A33',
  },

  rowActions: {
    marginTop: '10px',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },

  checkoutBtn: {
    padding: '7px 14px',
    borderRadius: '999px',
    border: 'none',
    backgroundImage: 'linear-gradient(135deg, #0A3D91, #1E5FE0)',
    color: '#F9FAFF',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 22px rgba(37,99,235,0.55)',
  },

  removeBtn: {
    padding: '7px 12px',
    borderRadius: '999px',
    border: '1px solid #FCA5A5',
    backgroundColor: '#FEF2F2',
    color: '#B91C1C',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },

  summarySide: {
    position: 'sticky',
    top: '88px',
    alignSelf: 'flex-start',
  },

  summaryCard: {
    borderRadius: '20px',
    padding: '18px 18px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(191,219,254,0.95)',
    boxShadow: '0 18px 40px rgba(15,23,42,0.12)',
    color: '#0B1A33',
  },

  summaryTitle: {
    margin: '0 0 10px',
    fontSize: '16px',
    fontWeight: 800,
    color: '#0B1A33',
  },

  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: '13px',
    borderBottom: '1px dashed rgba(209,213,219,0.9)',
    color: '#4B5563',
  },

  summaryTotalRow: {
    fontWeight: 800,
    color: '#0B1A33',
  },

  summaryPrimaryBtn: {
    width: '100%',
    marginTop: '14px',
    padding: '11px',
    borderRadius: '999px',
    border: 'none',
    backgroundImage: 'linear-gradient(135deg, #0A3D91, #1E5FE0)',
    color: '#F9FAFF',
    fontWeight: 800,
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 14px 30px rgba(37,99,235,0.55)',
  },

  summarySecondaryBtn: {
    width: '100%',
    marginTop: '8px',
    padding: '9px',
    borderRadius: '999px',
    border: '1px solid #CBD5F5',
    backgroundColor: 'transparent',
    color: '#0A3D91',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
  },

  emptyBox: {
    marginTop: '10px',
    backgroundColor: '#F9FAFB',
    borderRadius: '20px',
    padding: '24px 20px',
    textAlign: 'center',
    border: '1px dashed rgba(209,213,219,0.9)',
  },

  emptyIcon: {
    margin: 0,
    fontSize: '28px',
  },

  emptyTitle: {
    margin: '8px 0 2px',
    fontSize: '16px',
    fontWeight: 700,
    color: '#0B1A33',
  },

  emptyText: {
    margin: 0,
    fontSize: '13px',
    color: '#4B5563',
  },

  backBtn: {
    marginTop: '14px',
    padding: '9px 16px',
    borderRadius: '999px',
    border: 'none',
    backgroundImage: 'linear-gradient(135deg, #0A3D91, #1E5FE0)',
    color: '#F9FAFF',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '13px',
    boxShadow: '0 10px 22px rgba(37,99,235,0.55)',
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15,23,42,0.45)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '16px',
  },

  modal: {
    width: '100%',
    maxWidth: '420px',
    borderRadius: '20px',
    padding: '18px 20px 18px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 24px 60px rgba(15,23,42,0.3)',
    border: '1px solid rgba(191,219,254,0.95)',
    color: '#0B1A33',
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    marginBottom: '8px',
  },

  modalTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 800,
    color: '#0B1A33',
  },

  modalClose: {
    border: 'none',
    background: 'transparent',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#6B7280',
  },

  modalText: {
    margin: '6px 0',
    fontSize: '13px',
    color: '#4B5563',
  },

  modalChip: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '999px',
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    fontSize: '11px',
    fontWeight: 600,
  },

  modalField: {
    marginTop: '10px',
    textAlign: 'left',
  },

  modalLabel: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#0B1A33',
  },

  modalInput: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '10px',
    border: '1px solid #CBD5F5',
    fontSize: '13px',
    backgroundColor: '#F9FAFB',
    color: '#0B1A33',
    outline: 'none',
  },

  modalPrimaryBtn: {
    width: '100%',
    marginTop: '14px',
    padding: '10px',
    borderRadius: '999px',
    border: 'none',
    backgroundImage: 'linear-gradient(135deg, #0A3D91, #1E5FE0)',
    color: '#F9FAFF',
    fontWeight: 800,
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(37,99,235,0.55)',
  },

  /* Card form styles (inside modal) */
  cardForm: {
    marginTop: '10px',
    padding: '10px 10px 14px',
    borderRadius: '8px',
    border: '1px solid #d7d7d7',
    backgroundColor: '#FFFFFF',
  },

  cardField: {
    marginBottom: '12px',
  },

  cardLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#3b3b3b',
    marginBottom: '4px',
  },

  cardInput: {
    width: '100%',
    height: '40px',
    padding: '0 10px',
    fontSize: '13px',
    borderRadius: '4px',
    border: '1px solid #d7d7d7',
    outline: 'none',
  },

  cardNumberRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  cardLogos: {
    display: 'flex',
    gap: '4px',
    fontSize: '10px',
    fontWeight: 600,
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },

  cardLogoPill: {
    padding: '3px 6px',
    borderRadius: '12px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
  },

  cardRow: {
    display: 'flex',
    gap: '10px',
  },

  infoIcon: {
    display: 'inline-block',
    marginLeft: '4px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid #4caf50',
    color: '#4caf50',
    fontSize: '10px',
    textAlign: 'center',
    lineHeight: '12px',
    fontWeight: 700,
  },

  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '10px 0 8px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#3b3b3b',
  },

  payBtn: {
    marginTop: '12px',
    width: '100%',
    height: '44px',
    border: 'none',
    borderRadius: '999px',
    backgroundImage: 'linear-gradient(135deg, #0A3D91, #1E5FE0)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(15,23,42,0.35)',
  },

  cancelLink: {
    marginTop: '10px',
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: '#0A3D91',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },

  /* Invoice styles */
  invoiceCard: {
    width: '100%',
    maxWidth: '720px',
    backgroundColor: '#FFFFFF',
    padding: '28px 30px 24px',
    borderRadius: '12px',
    boxShadow: '0 24px 60px rgba(15,23,42,0.3)',
    border: '1px solid rgba(209,213,219,0.9)',
    color: '#0B1A33',
  },

  invoiceHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '18px',
  },

  invoiceTitle: {
    margin: '0 0 4px',
    color: '#1a67d1',
    fontSize: '20px',
  },

  invoiceMuted: {
    color: '#8b8b8b',
    fontSize: '12px',
  },

  invoiceTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '16px',
  },

  invoiceTh: {
    textAlign: 'left',
    fontSize: '13px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e2e2e2',
  },

  invoiceTd: {
    padding: '10px 0',
    fontSize: '13px',
    borderBottom: '1px solid #e2e2e2',
    verticalAlign: 'top',
  },

  invoiceRight: {
    textAlign: 'right',
  },

  invoiceSectionTitle: {
    marginTop: '22px',
    fontWeight: 700,
    fontSize: '13px',
  },

  thankYouBtn: {
    marginTop: '18px',
    padding: '10px 18px',
    borderRadius: '999px',
    border: 'none',
    backgroundColor: '#0A3D91',
    color: '#F9FAFF',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '13px',
    boxShadow: '0 10px 22px rgba(37,99,235,0.55)',
    display: 'block',
    marginLeft: 'auto',
  },
};

export default BookingCart;
