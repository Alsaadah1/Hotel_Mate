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
      cartItems.reduce((sum, item) => sum + calculateTotal(item), 0),
    [cartItems]
  );

  const handleCheckout = (item) => {
    if (!user?._id) {
      Swal.fire({
        icon: 'info',
        title: 'Please log in',
        text: 'You need to be logged in to confirm a booking.',
        confirmButtonColor: '#7a4a2e',
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
      confirmButtonColor: '#7a4a2e',
      cancelButtonColor: '#b91c1c',
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
      confirmButtonColor: '#7a4a2e',
      cancelButtonColor: '#b91c1c',
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
        confirmButtonColor: '#7a4a2e',
      });
      return;
    }

    // 🔐 Simple check: at least one payment field must be filled
    if (!cardNumber.trim() && !walletNumber.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Payment details required',
        text: 'Please enter a card number or an online wallet number.',
        confirmButtonColor: '#7a4a2e',
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
          confirmButtonColor: '#7a4a2e',
        });
        return;
      }

      if (digitsOnlyCard.length !== 16) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid card number',
          text: 'Card number must be 16 digits.',
          confirmButtonColor: '#7a4a2e',
        });
        return;
      }

      const expiryDigits = expiry.replace(/\D/g, '');
      if (expiryDigits.length !== 4) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid expiry date',
          text: 'Expiry must be in MM / YY format.',
          confirmButtonColor: '#7a4a2e',
        });
        return;
      }

      const month = parseInt(expiryDigits.slice(0, 2), 10);
      if (Number.isNaN(month) || month < 1 || month > 12) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid expiry month',
          text: 'Please enter a valid month between 01 and 12.',
          confirmButtonColor: '#7a4a2e',
        });
        return;
      }

      if (cvv.length !== 3) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid CVV',
          text: 'CVV must be exactly 3 digits.',
          confirmButtonColor: '#7a4a2e',
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

                <div style={styles.summaryNote}>
                  Secure booking • Premium service • Pay at hotel
                </div>
              </div>
            </aside>
          </div>
        </main>

        {/* === Summary Modal === */}
        {showSummary && selectedItem && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <div>
                  <p style={styles.modalKicker}>Reservation check</p>
                  <h3 style={styles.modalTitle}>Room summary</h3>
                </div>
                <button
                  style={styles.modalClose}
                  onClick={() => setShowSummary(false)}
                  aria-label="Close"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              <div style={styles.modalBody}>
                <p style={styles.modalTextStrong}>
                  {selectedItem.title || selectedItem.name}
                </p>

                <div style={styles.modalInfoGrid}>
                  <div style={styles.modalInfoItem}>
                    <span style={styles.modalInfoLabel}>Stay</span>
                    <span style={styles.modalChip}>{getDurationLabel(selectedItem)}</span>
                  </div>

                  {(() => {
                    const { from, to } = getStayDates(selectedItem);
                    if (!from || !to) return null;
                    return (
                      <div style={styles.modalInfoItem}>
                        <span style={styles.modalInfoLabel}>Dates</span>
                        <span style={styles.modalChip}>{from} → {to}</span>
                      </div>
                    );
                  })()}

                  {selectedItem.guestCount && (
                    <div style={styles.modalInfoItem}>
                      <span style={styles.modalInfoLabel}>Guests</span>
                      <span style={styles.modalChip}>{selectedItem.guestCount}</span>
                    </div>
                  )}

                  <div style={styles.modalInfoItem}>
                    <span style={styles.modalInfoLabel}>Total</span>
                    <span style={styles.modalTotalPill}>
                      OMR {calculateTotal(selectedItem).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button style={styles.modalPrimaryBtn} onClick={handleProceed}>
                  Looks good – next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === Payment Modal with card-form design === */}
        {showPayment && selectedItem && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <div>
                  <p style={styles.modalKicker}>Final step</p>
                  <h3 style={styles.modalTitle}>Confirm booking & payment</h3>
                </div>
                <button
                  style={styles.modalClose}
                  onClick={() => setShowPayment(false)}
                  aria-label="Close"
                  title="Close"
                >
                  ✕
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
                  <div style={styles.modalSummaryBar}>
                    <div style={styles.modalSummaryTitle}>
                      {(selectedItem.title || selectedItem.name)}
                    </div>
                    <div style={styles.modalSummaryMeta}>
                      <span style={styles.modalMiniPill}>{getDurationLabel(selectedItem)}</span>
                      {from && to && <span style={styles.modalMiniPill}>{from} → {to}</span>}
                      {guests && <span style={styles.modalMiniPill}>Guests: {guests}</span>}
                    </div>
                  </div>
                );
              })()}

              <p style={styles.modalText}>
                <strong>Payment method:</strong> Pay at hotel
              </p>
              <p style={styles.modalText}>
                We only store your card number or online wallet number for this reservation record.
                No real online payment is processed.
              </p>

              {/* 🔹 Card form styled like premium theme */}
              <div style={styles.cardForm}>
                <div style={styles.cardFormTopLine} />

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
                    <label style={styles.cardLabel}>CVV</label>
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

                <div style={styles.payNote}>
                  <span style={styles.payNoteDot} />
                  Your information is stored only with this reservation record.
                </div>
              </div>

              <div style={styles.modalTotalRow}>
                <span style={styles.modalTotalLabel}>Total amount</span>
                <span style={styles.modalTotalValue}>
                  OMR {calculateTotal(selectedItem).toFixed(2)}
                </span>
              </div>

              <button style={styles.payBtn} onClick={handleConfirmRental}>
                Confirm reservation
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
              <div style={styles.invoiceTopBar} />

              {/* Header */}
              <div style={styles.invoiceHeaderRow}>
                <div>
                  <h2 style={styles.invoiceTitle}>
                    Hotel Mate <span style={{ color: '#2b1a12' }}>Stay</span>
                  </h2>
                  <div style={styles.invoiceMuted}>
                    INVOICE<br />
                    #{(selectedItem._id || 'HM-BOOK').toString().slice(-6)}
                  </div>
                </div>
                <div style={styles.invoiceMuted}>
                  DATE<br />
                  {todayStr}
                </div>
              </div>

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

                  <tr>
                    <td style={styles.invoiceTd} />
                    <td style={{ ...styles.invoiceTd, ...styles.invoiceRight, fontWeight: 900 }}>
                      SUBTOTAL
                    </td>
                    <td style={{ ...styles.invoiceTd, ...styles.invoiceRight, fontWeight: 900 }}>
                      {formatOMR(calculateTotal(selectedItem))}
                    </td>
                  </tr>

                  <tr>
                    <td style={styles.invoiceTd} />
                    <td style={{ ...styles.invoiceTd, ...styles.invoiceRight, fontWeight: 900 }}>
                      TAXES
                    </td>
                    <td style={{ ...styles.invoiceTd, ...styles.invoiceRight, fontWeight: 900 }}>
                      {formatOMR(0)}
                    </td>
                  </tr>

                  <tr>
                    <td style={styles.invoiceTd} />
                    <td style={{ ...styles.invoiceTd, ...styles.invoiceRight, fontWeight: 900, fontSize: 16 }}>
                      GRAND TOTAL
                    </td>
                    <td style={{ ...styles.invoiceTd, ...styles.invoiceRight, fontWeight: 900, fontSize: 16 }}>
                      {formatOMR(calculateTotal(selectedItem))}
                    </td>
                  </tr>
                </tbody>
              </table>

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
   STYLES – HOTEL MATE THEME (BROWN / GOLD LUXURY)
   ====================== */

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f7f1e6',
    backgroundImage:
      'radial-gradient(circle at top left, rgba(212,175,55,0.18), transparent 55%), ' +
      'radial-gradient(circle at bottom right, rgba(122,74,46,0.16), transparent 55%)',
    color: '#2b1a12',
  },

  band: {
    padding: '20px 16px 18px',
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
    border: '1px solid rgba(122,74,46,0.16)',
    backgroundImage:
      'radial-gradient(circle at top left, rgba(212,175,55,0.22), transparent 70%), ' +
      'radial-gradient(circle at bottom right, rgba(122,74,46,0.18), transparent 70%), ' +
      'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,248,225,0.78))',
    boxShadow: '0 18px 46px rgba(43,26,18,0.18)',
  },

  stepLabel: {
    margin: 0,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    color: '#7a4a2e',
    fontWeight: 900,
  },

  bandHeading: {
    margin: '6px 0 4px',
    fontSize: '22px',
    fontWeight: 900,
    color: '#2b1a12',
    letterSpacing: '0.02em',
  },

  bandText: {
    margin: 0,
    fontSize: '13px',
    color: 'rgba(43,26,18,0.72)',
    lineHeight: 1.55,
  },

  bandTotalsBox: {
    padding: '10px 14px',
    borderRadius: '16px',
    backgroundColor: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(122,74,46,0.14)',
    minWidth: '220px',
    boxShadow: '0 14px 30px rgba(43,26,18,0.14)',
  },

  bandTotalsLabel: {
    fontSize: '11px',
    color: 'rgba(43,26,18,0.62)',
    marginBottom: '4px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },

  bandTotalsAmount: {
    fontSize: '18px',
    fontWeight: 900,
    color: '#7a4a2e',
  },

  bandTotalsHint: {
    marginTop: '4px',
    fontSize: '11px',
    color: 'rgba(43,26,18,0.62)',
    lineHeight: 1.45,
  },

  wrapper: {
    maxWidth: '1140px',
    margin: '0 auto',
    padding: '18px 20px 36px',
  },

  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 2.1fr) minmax(260px, 0.9fr)',
    gap: '20px',
  },

  listPanel: {
    borderRadius: '22px',
    padding: '16px 14px 14px',
    backgroundColor: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(122,74,46,0.14)',
    boxShadow: '0 18px 46px rgba(43,26,18,0.12)',
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
    fontWeight: 900,
    color: '#2b1a12',
    letterSpacing: '0.02em',
  },

  sectionSub: {
    margin: '2px 0 0',
    fontSize: '12px',
    color: 'rgba(43,26,18,0.70)',
  },

  clearBtn: {
    padding: '7px 12px',
    borderRadius: '999px',
    border: '1px solid rgba(185,28,28,0.25)',
    backgroundColor: 'rgba(185,28,28,0.08)',
    color: '#b91c1c',
    fontSize: '11px',
    fontWeight: 900,
    cursor: 'pointer',
  },

  itemRow: {
    display: 'flex',
    gap: '14px',
    padding: '12px 12px',
    borderRadius: '18px',
    backgroundColor: 'rgba(212,175,55,0.08)',
    border: '1px solid rgba(212,175,55,0.20)',
    marginTop: '10px',
  },

  thumbWrap: {
    flex: '0 0 90px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'center',
  },

  thumb: {
    width: '90px',
    height: '90px',
    borderRadius: '14px',
    objectFit: 'cover',
    border: '1px solid rgba(122,74,46,0.16)',
    backgroundColor: '#efe7da',
    boxShadow: '0 12px 24px rgba(43,26,18,0.12)',
  },

  roomBadge: {
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '999px',
    backgroundColor: 'rgba(255,255,255,0.72)',
    border: '1px solid rgba(122,74,46,0.18)',
    color: '#7a4a2e',
    fontWeight: 900,
    letterSpacing: '0.02em',
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
    fontWeight: 900,
    color: '#2b1a12',
  },

  itemMeta: {
    marginTop: '6px',
  },

  badge: {
    display: 'inline-block',
    padding: '5px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    backgroundColor: 'rgba(255,255,255,0.72)',
    border: '1px solid rgba(122,74,46,0.18)',
    color: '#7a4a2e',
    fontWeight: 900,
  },

  itemDates: {
    marginTop: '5px',
    fontSize: '11px',
    color: 'rgba(43,26,18,0.74)',
  },

  itemDatesLabel: {
    fontWeight: 900,
    color: 'rgba(43,26,18,0.80)',
  },

  itemPriceBlock: {
    textAlign: 'right',
    minWidth: '140px',
  },

  itemPriceLabel: {
    fontSize: '11px',
    color: 'rgba(43,26,18,0.62)',
    marginBottom: '3px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.10em',
  },

  itemPrice: {
    fontSize: '14px',
    fontWeight: 900,
    color: '#7a4a2e',
  },

  rowActions: {
    marginTop: '10px',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },

  checkoutBtn: {
    padding: '8px 14px',
    borderRadius: '999px',
    border: '1px solid rgba(212,175,55,0.35)',
    backgroundImage: 'linear-gradient(135deg, #7a4a2e, #d4af37)',
    color: '#fff8e1',
    fontSize: '12px',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 14px 28px rgba(43,26,18,0.20)',
  },

  removeBtn: {
    padding: '8px 12px',
    borderRadius: '999px',
    border: '1px solid rgba(185,28,28,0.25)',
    backgroundColor: 'rgba(185,28,28,0.08)',
    color: '#b91c1c',
    fontSize: '12px',
    fontWeight: 900,
    cursor: 'pointer',
  },

  summarySide: {
    position: 'sticky',
    top: '88px',
    alignSelf: 'flex-start',
  },

  summaryCard: {
    borderRadius: '22px',
    padding: '18px 18px 16px',
    backgroundColor: 'rgba(255,255,255,0.84)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(122,74,46,0.14)',
    boxShadow: '0 18px 46px rgba(43,26,18,0.16)',
    color: '#2b1a12',
  },

  summaryTitle: {
    margin: '0 0 10px',
    fontSize: '16px',
    fontWeight: 900,
    color: '#2b1a12',
    letterSpacing: '0.02em',
  },

  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '7px 0',
    fontSize: '13px',
    borderBottom: '1px dashed rgba(122,74,46,0.22)',
    color: 'rgba(43,26,18,0.74)',
  },

  summaryTotalRow: {
    fontWeight: 900,
    color: '#2b1a12',
  },

  summaryPrimaryBtn: {
    width: '100%',
    marginTop: '14px',
    padding: '11px',
    borderRadius: '999px',
    border: '1px solid rgba(212,175,55,0.35)',
    backgroundImage: 'linear-gradient(135deg, #7a4a2e, #d4af37)',
    color: '#fff8e1',
    fontWeight: 900,
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 16px 34px rgba(43,26,18,0.22)',
    letterSpacing: '0.02em',
  },

  summarySecondaryBtn: {
    width: '100%',
    marginTop: '8px',
    padding: '9px',
    borderRadius: '999px',
    border: '1px solid rgba(122,74,46,0.26)',
    backgroundColor: 'transparent',
    color: '#7a4a2e',
    fontWeight: 900,
    fontSize: '13px',
    cursor: 'pointer',
  },

  summaryNote: {
    marginTop: 12,
    fontSize: '12px',
    color: 'rgba(43,26,18,0.62)',
    textAlign: 'center',
  },

  emptyBox: {
    marginTop: '10px',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: '22px',
    padding: '24px 20px',
    textAlign: 'center',
    border: '1px dashed rgba(122,74,46,0.22)',
  },

  emptyIcon: {
    margin: 0,
    fontSize: '28px',
  },

  emptyTitle: {
    margin: '8px 0 2px',
    fontSize: '16px',
    fontWeight: 900,
    color: '#2b1a12',
  },

  emptyText: {
    margin: 0,
    fontSize: '13px',
    color: 'rgba(43,26,18,0.70)',
    lineHeight: 1.55,
  },

  backBtn: {
    marginTop: '14px',
    padding: '10px 16px',
    borderRadius: '999px',
    border: '1px solid rgba(212,175,55,0.35)',
    backgroundImage: 'linear-gradient(135deg, #7a4a2e, #d4af37)',
    color: '#fff8e1',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: '13px',
    boxShadow: '0 14px 28px rgba(43,26,18,0.20)',
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(43,26,18,0.55)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '16px',
  },

  modal: {
    width: '100%',
    maxWidth: '460px',
    borderRadius: '22px',
    padding: '16px 16px 16px',
    backgroundColor: 'rgba(255,255,255,0.90)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
    border: '1px solid rgba(212,175,55,0.28)',
    color: '#2b1a12',
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '10px',
    marginBottom: '10px',
  },

  modalKicker: {
    margin: 0,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: '#7a4a2e',
    fontWeight: 900,
  },

  modalTitle: {
    margin: '4px 0 0',
    fontSize: '16px',
    fontWeight: 900,
    color: '#2b1a12',
  },

  modalClose: {
    border: '1px solid rgba(122,74,46,0.18)',
    background: 'rgba(255,255,255,0.72)',
    width: 36,
    height: 36,
    borderRadius: 12,
    cursor: 'pointer',
    fontWeight: 900,
    color: 'rgba(43,26,18,0.85)',
    boxShadow: '0 10px 18px rgba(43,26,18,0.10)',
  },

  modalBody: {
    marginTop: 4,
  },

  modalTextStrong: {
    margin: '6px 0 10px',
    fontSize: '14px',
    fontWeight: 900,
    color: '#2b1a12',
  },

  modalText: {
    margin: '6px 0',
    fontSize: '13px',
    color: 'rgba(43,26,18,0.72)',
    lineHeight: 1.55,
  },

  modalInfoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginTop: '10px',
  },

  modalInfoItem: {
    borderRadius: '14px',
    padding: '10px 12px',
    backgroundColor: 'rgba(212,175,55,0.10)',
    border: '1px solid rgba(212,175,55,0.20)',
  },

  modalInfoLabel: {
    display: 'block',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    color: 'rgba(43,26,18,0.66)',
    fontWeight: 900,
    marginBottom: 6,
  },

  modalChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: '999px',
    backgroundColor: 'rgba(255,255,255,0.78)',
    border: '1px solid rgba(122,74,46,0.18)',
    color: '#7a4a2e',
    fontSize: '11px',
    fontWeight: 900,
  },

  modalTotalPill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: '999px',
    backgroundImage: 'linear-gradient(135deg, #7a4a2e, #d4af37)',
    border: '1px solid rgba(212,175,55,0.35)',
    color: '#fff8e1',
    fontSize: '11px',
    fontWeight: 900,
  },

  modalPrimaryBtn: {
    width: '100%',
    marginTop: '14px',
    padding: '11px',
    borderRadius: '999px',
    border: '1px solid rgba(212,175,55,0.35)',
    backgroundImage: 'linear-gradient(135deg, #7a4a2e, #d4af37)',
    color: '#fff8e1',
    fontWeight: 900,
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 16px 34px rgba(43,26,18,0.22)',
    letterSpacing: '0.02em',
  },

  modalSummaryBar: {
    marginTop: 8,
    marginBottom: 10,
    borderRadius: '16px',
    padding: '10px 12px',
    backgroundColor: 'rgba(212,175,55,0.10)',
    border: '1px solid rgba(212,175,55,0.20)',
  },

  modalSummaryTitle: {
    fontWeight: 900,
    color: '#2b1a12',
    fontSize: '13px',
  },

  modalSummaryMeta: {
    marginTop: 8,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },

  modalMiniPill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: '999px',
    backgroundColor: 'rgba(255,255,255,0.78)',
    border: '1px solid rgba(122,74,46,0.18)',
    color: '#7a4a2e',
    fontSize: '11px',
    fontWeight: 900,
  },

  modalField: {
    marginTop: '10px',
    textAlign: 'left',
  },

  modalLabel: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '12px',
    fontWeight: 900,
    color: 'rgba(43,26,18,0.88)',
    letterSpacing: '0.02em',
  },

  modalInput: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid rgba(122,74,46,0.20)',
    fontSize: '13px',
    backgroundColor: 'rgba(255,255,255,0.86)',
    color: '#2b1a12',
    outline: 'none',
  },

  /* Card form styles (inside modal) */
  cardForm: {
    marginTop: '10px',
    padding: '12px 12px 12px',
    borderRadius: '18px',
    border: '1px solid rgba(122,74,46,0.14)',
    backgroundColor: 'rgba(255,255,255,0.78)',
    boxShadow: '0 14px 30px rgba(43,26,18,0.10)',
  },

  cardFormTopLine: {
    height: 1,
    width: '100%',
    marginBottom: 12,
    background:
      'linear-gradient(90deg, transparent, rgba(212,175,55,0.70), transparent)',
  },

  cardField: {
    marginBottom: '12px',
  },

  cardLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 900,
    color: 'rgba(43,26,18,0.80)',
    marginBottom: '6px',
    letterSpacing: '0.02em',
  },

  cardInput: {
    width: '100%',
    height: '42px',
    padding: '0 12px',
    fontSize: '13px',
    borderRadius: '12px',
    border: '1px solid rgba(122,74,46,0.20)',
    outline: 'none',
    backgroundColor: 'rgba(255,255,255,0.86)',
    color: '#2b1a12',
  },

  cardNumberRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  cardRow: {
    display: 'flex',
    gap: '10px',
  },

  payNote: {
    marginTop: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '12px',
    color: 'rgba(43,26,18,0.62)',
  },

  payNoteDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#d4af37',
    boxShadow: '0 0 0 3px rgba(212,175,55,0.18)',
  },

  modalTotalRow: {
    marginTop: 12,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '16px',
    padding: '10px 12px',
    backgroundColor: 'rgba(212,175,55,0.10)',
    border: '1px solid rgba(212,175,55,0.20)',
  },

  modalTotalLabel: {
    fontSize: '12px',
    fontWeight: 900,
    color: 'rgba(43,26,18,0.72)',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
  },

  modalTotalValue: {
    fontSize: '14px',
    fontWeight: 900,
    color: '#7a4a2e',
  },

  payBtn: {
    marginTop: '12px',
    width: '100%',
    height: '46px',
    border: '1px solid rgba(212,175,55,0.35)',
    borderRadius: '999px',
    backgroundImage: 'linear-gradient(135deg, #7a4a2e, #d4af37)',
    color: '#fff8e1',
    fontSize: '14px',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 16px 34px rgba(43,26,18,0.22)',
    letterSpacing: '0.02em',
  },

  cancelLink: {
    marginTop: '10px',
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: '#7a4a2e',
    fontSize: '13px',
    fontWeight: 900,
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },

  /* Invoice styles */
  invoiceCard: {
    width: '100%',
    maxWidth: '760px',
    backgroundColor: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding: '26px 28px 22px',
    borderRadius: '18px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
    border: '1px solid rgba(212,175,55,0.28)',
    color: '#2b1a12',
    position: 'relative',
    overflow: 'hidden',
  },

  invoiceTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundImage: 'linear-gradient(90deg, #7a4a2e, #d4af37)',
  },

  invoiceHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '18px',
    gap: 12,
  },

  invoiceTitle: {
    margin: '0 0 6px',
    color: '#7a4a2e',
    fontSize: '20px',
    fontWeight: 900,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },

  invoiceMuted: {
    color: 'rgba(43,26,18,0.62)',
    fontSize: '12px',
    lineHeight: 1.45,
  },

  invoiceTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '16px',
  },

  invoiceTh: {
    textAlign: 'left',
    fontSize: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(122,74,46,0.18)',
    color: 'rgba(43,26,18,0.72)',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 900,
  },

  invoiceTd: {
    padding: '10px 0',
    fontSize: '13px',
    borderBottom: '1px solid rgba(122,74,46,0.14)',
    verticalAlign: 'top',
    color: '#2b1a12',
  },

  invoiceRight: {
    textAlign: 'right',
  },

  invoiceSectionTitle: {
    marginTop: '18px',
    fontWeight: 900,
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    color: '#7a4a2e',
  },

  thankYouBtn: {
    marginTop: '18px',
    padding: '11px 18px',
    borderRadius: '999px',
    border: '1px solid rgba(212,175,55,0.35)',
    backgroundImage: 'linear-gradient(135deg, #7a4a2e, #d4af37)',
    color: '#fff8e1',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: '13px',
    boxShadow: '0 16px 34px rgba(43,26,18,0.22)',
    display: 'block',
    marginLeft: 'auto',
  },
};

export default BookingCart;
