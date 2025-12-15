// src/pages/ManagementOverview.jsx

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar"; // ✅ your global navbar
import useLocation from "../utils/useLocation";
import { useSelector } from "react-redux";

const ManagementOverview = () => {
  const { placeInfo, error } = useLocation();
  const user = useSelector((state) => state.users.user);
  const API_URL = process.env.REACT_APP_SERVER_URL;

  const [roomsCount, setRoomsCount] = useState(0);
  const [confirmedBookings, setConfirmedBookings] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    // ✅ Allow both owner and staff
    if (!user || (user.role !== "owner" && user.role !== "staff")) return;

    const fetchDashboardData = async () => {
      try {
        const roomsRes = await fetch(`${API_URL}/api/rooms/manager/${user._id}`);
        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          if (Array.isArray(roomsData)) setRoomsCount(roomsData.length);
        } else {
          setRoomsCount(0);
        }

        const bookingsRes = await fetch(`${API_URL}/api/bookings/owner/${user._id}`);
        if (!bookingsRes.ok) {
          setConfirmedBookings(0);
          setPendingBookings(0);
          setTotalRevenue(0);
          return;
        }

        const bookingsData = await bookingsRes.json();

        if (Array.isArray(bookingsData)) {
          let confirmed = 0;
          let pending = 0;
          let revenue = 0;

          bookingsData.forEach((booking) => {
            const status = (booking.status || "").toLowerCase();
            if (status === "approved") {
              confirmed += 1;
              revenue += Number(booking.totalCost) || 0;
            } else if (status === "pending") {
              pending += 1;
            }
          });

          setConfirmedBookings(confirmed);
          setPendingBookings(pending);
          setTotalRevenue(revenue);
        }
      } catch (err) {
        console.error("Error loading management overview data:", err);
      }
    };

    fetchDashboardData();
  }, [API_URL, user]);

  const totalBookings = confirmedBookings + pendingBookings;
  const bookingsBase = totalBookings > 0 ? totalBookings : 1;

  const confirmedPercent = Math.round((confirmedBookings / bookingsBase) * 100);
  const pendingPercent = Math.round((pendingBookings / bookingsBase) * 100);

  const revenueGoal = Math.max(500, totalRevenue * 1.3);
  const revenueRatio = revenueGoal > 0 ? Math.min(totalRevenue / revenueGoal, 1) : 0;

  return (
    <>
      {/* ✅ YOUR navbar (menu + logout handled there) */}
      <Navbar />

      {/* ✅ This page contains ONLY content (NO duplicate sidebar/menu) */}
      <div className="adm-page">
        <div className="adm-wrap">
          <header className="adm-top">
            <div>
              <div className="adm-kicker">HOTEL MATE</div>
              <h1 className="adm-title">Property Management Overview</h1>
              <p className="adm-subtitle">
                Monitor your rooms, bookings, and revenue performance in one place.
              </p>
            </div>

           
          </header>

          <section className="adm-grid">
            <div className="adm-card">
              <div className="adm-card-head">
                <div className="adm-card-label">Rooms listed</div>
                <div className="adm-chip">Total</div>
              </div>
              <div className="adm-metric">{roomsCount}</div>
              <div className="adm-hint">Total rooms currently available in your property.</div>
            </div>

            <div className="adm-card">
              <div className="adm-card-head">
                <div className="adm-card-label">Confirmed bookings</div>
                <div className="adm-chip ok">Approved</div>
              </div>
              <div className="adm-metric">{confirmedBookings}</div>
              <div className="adm-hint">Bookings that have been approved and confirmed.</div>
            </div>

            <div className="adm-card">
              <div className="adm-card-head">
                <div className="adm-card-label">Pending requests</div>
                <div className="adm-chip warn">Waiting</div>
              </div>
              <div className="adm-metric">{pendingBookings}</div>
              <div className="adm-hint">New booking requests waiting for your review.</div>
            </div>

            <div className="adm-card">
              <div className="adm-card-head">
                <div className="adm-card-label">Total room revenue</div>
                <div className="adm-chip">OMR</div>
              </div>
              <div className="adm-metric">OMR {totalRevenue.toFixed(2)}</div>
              <div className="adm-hint">Calculated from all approved bookings.</div>
            </div>

            <div className="adm-card adm-span-2">
              <div className="adm-panel-title">Booking &amp; revenue insights</div>
              <div className="adm-panel-sub">
                A quick visual snapshot of your booking mix and revenue progress.
              </div>

              <div className="adm-block">
                <div className="adm-block-top">
                  <div className="adm-block-title">Bookings mix</div>
                  <div className="adm-tag">{totalBookings} total</div>
                </div>

                <div className="adm-legend">
                  <span className="dot dot-ok" />
                  <span className="leg">Confirmed</span>
                  <span className="dot dot-warn" />
                  <span className="leg">Pending</span>
                </div>

                <div className="adm-bar">
                  <div className="adm-bar-ok" style={{ width: `${confirmedPercent}%` }}>
                    {confirmedBookings > 0 && (
                      <span className="adm-bar-txt">{confirmedPercent}%</span>
                    )}
                  </div>
                  <div className="adm-bar-warn" style={{ width: `${pendingPercent}%` }}>
                    {pendingBookings > 0 && (
                      <span className="adm-bar-txt">{pendingPercent}%</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="adm-block">
                <div className="adm-block-top">
                  <div className="adm-block-title">Revenue progress</div>
                  <div className="adm-tag soft">Soft goal: OMR {revenueGoal.toFixed(0)}</div>
                </div>

                <div className="adm-row">
                  <div className="adm-row-left">Current: OMR {totalRevenue.toFixed(2)}</div>
                  <div className="adm-row-right">{Math.round(revenueRatio * 100)}% of goal</div>
                </div>

                <div className="adm-progress">
                  <div
                    className="adm-progress-fill"
                    style={{ width: `${revenueRatio * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="adm-card">
              <div className="adm-panel-title">Hotel location snapshot</div>
              <div className="adm-panel-sub">
                Helps personalise booking context and guest summaries.
              </div>

              {error && <div className="adm-error">{error}</div>}

              {placeInfo ? (
                <div className="adm-loc">
                  <div>
                    <strong>City:</strong> {placeInfo.city || "—"}
                  </div>
                  <div>
                    <strong>Region:</strong> {placeInfo.region || "—"}
                  </div>
                  <div>
                    <strong>Country:</strong> {placeInfo.country || "—"}
                  </div>
                </div>
              ) : !error ? (
                <div className="adm-hint">Detecting hotel location…</div>
              ) : null}
            </div>
          </section>
        </div>

        <style>{`
          :root{
            --hm-brown-deep:#5a3a1a;
            --hm-gold:#c9a24d;
            --hm-ink:#3d2a14;
            --hm-muted:#6b5a3c;
            --hm-subtle:#8c7a55;
            --hm-card:#ffffff;
            --hm-border:rgba(90,58,26,0.16);
            --hm-shadow: 0 18px 40px rgba(61,42,20,0.14);
          }

          .adm-page{
            min-height: 100vh;
            background-color: #fbf8f3;
            background-image:
              radial-gradient(circle at top right, rgba(201,162,77,0.20), transparent 55%),
              radial-gradient(circle at bottom left, rgba(90,58,26,0.12), transparent 55%);
          }

          .adm-wrap{
            max-width: 1280px;
            margin: 0 auto;
            padding: 18px 16px 40px;
          }

          .adm-top{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 14px;
            padding: 16px 16px 18px;
            border-radius: 18px;
            background:
              radial-gradient(circle at top left, rgba(201,162,77,0.18), transparent 55%),
              linear-gradient(145deg, #ffffff, #fbf6ec);
            border: 1px solid var(--hm-border);
            box-shadow: var(--hm-shadow);
            margin-bottom: 14px;
          }

          .adm-kicker{
            font-size: 11px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: var(--hm-subtle);
            font-weight: 900;
          }

          .adm-title{
            margin: 6px 0 6px;
            font-size: 22px;
            font-weight: 900;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: var(--hm-ink);
          }

          .adm-subtitle{
            margin: 0;
            font-size: 13px;
            color: var(--hm-muted);
            font-weight: 600;
            max-width: 720px;
          }

          .adm-support{
            text-decoration: none;
            white-space: nowrap;
            padding: 10px 14px;
            border-radius: 999px;
            font-weight: 900;
            color: #fff;
            background: linear-gradient(135deg, var(--hm-brown-deep), var(--hm-gold));
            box-shadow: 0 14px 30px rgba(61,42,20,0.24);
          }

          .adm-grid{
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
          }

          .adm-card{
            background: var(--hm-card);
            border: 1px solid var(--hm-border);
            border-radius: 18px;
            box-shadow: var(--hm-shadow);
            padding: 14px;
            min-width: 0;
          }

          .adm-span-2{ grid-column: span 2; }

          .adm-card-head{
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }

          .adm-card-label{
            color: var(--hm-subtle);
            font-weight: 800;
            font-size: 0.92rem;
          }

          .adm-chip{
            font-size: 12px;
            font-weight: 800;
            color: var(--hm-brown-deep);
            background: rgba(201,162,77,0.16);
            border: 1px solid rgba(139,106,47,0.22);
            padding: 4px 10px;
            border-radius: 999px;
          }
          .adm-chip.ok{
            background: rgba(34,197,94,0.10);
            border-color: rgba(22,163,74,0.25);
            color: #166534;
          }
          .adm-chip.warn{
            background: rgba(234,179,8,0.12);
            border-color: rgba(234,179,8,0.25);
            color: #7c2d12;
          }

          .adm-metric{
            margin-top: 10px;
            font-size: 1.7rem;
            font-weight: 900;
            letter-spacing: 0.03em;
            color: var(--hm-ink);
          }

          .adm-hint{
            margin-top: 8px;
            font-size: 0.84rem;
            color: var(--hm-subtle);
            font-weight: 600;
          }

          .adm-panel-title{
            font-weight: 900;
            color: var(--hm-ink);
            margin: 0 0 4px;
            font-size: 1rem;
          }

          .adm-panel-sub{
            color: var(--hm-subtle);
            font-weight: 600;
            font-size: 0.86rem;
            margin-bottom: 10px;
          }

          .adm-block{
            margin-top: 12px;
            background: linear-gradient(145deg, #ffffff, #fffdf8);
            border: 1px solid rgba(139,106,47,0.16);
            border-radius: 14px;
            padding: 12px;
          }

          .adm-block-top{
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
          }

          .adm-block-title{
            font-weight: 900;
            color: var(--hm-ink);
            font-size: 0.95rem;
          }

          .adm-tag{
            font-size: 12px;
            font-weight: 800;
            color: #166534;
            background: rgba(34,197,94,0.10);
            border: 1px solid rgba(22,163,74,0.25);
            padding: 4px 10px;
            border-radius: 999px;
          }

          .adm-tag.soft{
            color: var(--hm-ink);
            background: rgba(201,162,77,0.12);
            border-color: rgba(139,106,47,0.20);
          }

          .adm-legend{
            display: flex;
            gap: 8px;
            align-items: center;
            margin-top: 10px;
            margin-bottom: 10px;
            font-size: 12px;
            color: var(--hm-muted);
            font-weight: 700;
          }

          .dot{ width: 9px; height: 9px; border-radius: 999px; display: inline-block; }
          .dot-ok{ background: #22c55e; }
          .dot-warn{ background: #eab308; }
          .leg{ margin-right: 10px; }

          .adm-bar{
            width: 100%;
            height: 24px;
            border-radius: 999px;
            overflow: hidden;
            display: flex;
            border: 1px solid rgba(139,106,47,0.18);
            background: rgba(201,162,77,0.10);
          }

          .adm-bar-ok{
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #22c55e, #16a34a);
          }

          .adm-bar-warn{
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #facc15, #eab308);
          }

          .adm-bar-txt{
            font-size: 12px;
            font-weight: 900;
            color: rgba(61,42,20,0.90);
            padding: 0 6px;
            white-space: nowrap;
          }

          .adm-row{
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
            margin-bottom: 8px;
            font-size: 12px;
            font-weight: 800;
            color: var(--hm-muted);
          }

          .adm-row-right{ color: var(--hm-brown-deep); }

          .adm-progress{
            width: 100%;
            height: 20px;
            border-radius: 999px;
            overflow: hidden;
            border: 1px solid rgba(139,106,47,0.18);
            background: rgba(201,162,77,0.10);
          }

          .adm-progress-fill{
            height: 100%;
            border-radius: 999px;
            background: linear-gradient(135deg, var(--hm-brown-deep), var(--hm-gold));
            box-shadow: 0 10px 22px rgba(61,42,20,0.22);
            transition: width 0.3s ease;
          }

          .adm-loc{
            margin-top: 10px;
            border-radius: 14px;
            padding: 12px;
            border: 1px solid rgba(139,106,47,0.16);
            background: linear-gradient(145deg, #ffffff, #fffdf8);
            color: var(--hm-ink);
            font-weight: 700;
            font-size: 0.92rem;
            line-height: 1.7;
          }

          .adm-error{
            margin-top: 8px;
            color: #b91c1c;
            font-weight: 800;
            font-size: 0.88rem;
          }

          @media (max-width: 1100px){
            .adm-grid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .adm-span-2{ grid-column: span 2; }
          }

          @media (max-width: 820px){
            .adm-grid{ grid-template-columns: 1fr; }
            .adm-span-2{ grid-column: span 1; }
          }
        `}</style>
      </div>
    </>
  );
};

export default ManagementOverview;
