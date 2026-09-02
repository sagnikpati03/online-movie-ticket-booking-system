import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import logo from "../../pictures/logo.png";
import { API_URL } from "../../config/api";

const emptyMovie = {
    title: "", description: "", genre: "", language: "", duration_minutes: "",
    release_date: "", certificate: "", director: "", cast: "", poster_url: "",
    trailer_url: "", status: "active"
};
const emptyTheatre = { name: "", address: "", city: "", contact: "" };
const emptyScreen = { theatre_id: "", name: "", seat_capacity: 0 };
const emptySeat = { screen_id: "", seat_number: "", seat_type: "regular", price_multiplier: 1, is_active: true };
const emptyShow = {
    movie_id: "", theatre_id: "", screen_id: "", show_date: "",
    start_time: "", end_time: "", base_price: "", status: "active"
};

function AdminDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "A";

    const [tab, setTab] = useState("overview");
    const [stats, setStats] = useState({});
    const [data, setData] = useState({
        users: [], movies: [], theatres: [], screens: [], seats: [], shows: [], bookings: [], payments: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [editing, setEditing] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);

    const [movie, setMovie] = useState(emptyMovie);
    const [theatre, setTheatre] = useState(emptyTheatre);
    const [screen, setScreen] = useState(emptyScreen);
    const [seat, setSeat] = useState(emptySeat);
    const [show, setShow] = useState(emptyShow);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const api = async (path, options = {}) => {
        const response = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: { ...headers, ...(options.headers || {}) }
        });
        const body = await response.json().catch(() => ({}));
        if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
            throw new Error("Session expired.");
        }
        if (response.status === 403) {
            navigate("/home", { replace: true });
            throw new Error("Admin access required.");
        }
        if (!response.ok) throw new Error(body.message || "Request failed.");
        return body;
    };

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const [dashboard, management] = await Promise.all([
                api("/api/admin/dashboard"),
                api("/api/admin/management")
            ]);
            setStats(dashboard.stats || {});
            setData({
                users: management.users || [],
                movies: management.movies || [],
                theatres: management.theatres || [],
                screens: management.screens || [],
                seats: management.seats || [],
                shows: management.shows || [],
                bookings: management.bookings || [],
                payments: management.payments || []
            });
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role !== "admin" || !token) {
            navigate("/login", { replace: true });
            return;
        }
        load();
    }, []);

    const flash = (message) => {
        setNotice(message);
        setTimeout(() => setNotice(""), 3000);
    };

    const save = async (path, method, body, reset) => {
        try {
            const result = await api(path, {
                method,
                body: JSON.stringify(body)
            });
            flash(result.message || "Saved successfully.");
            reset();
            setEditing(null);
            await load();
        } catch (e) {
            setError(e.message);
        }
    };

    const remove = async (path, message) => {
        if (!window.confirm(message)) return;
        try {
            const result = await api(path, { method: "DELETE" });
            flash(result.message || "Deleted successfully.");
            await load();
        } catch (e) {
            setError(e.message);
        }
    };

    const updateUser = async (u) => {
        const name = window.prompt("User name:", u.name);
        if (name === null) return;
        const phone = window.prompt("Phone:", u.phone || "");
        if (phone === null) return;
        const role = window.prompt("Role (customer/admin):", u.role);
        if (role === null) return;
        if (!["customer", "admin"].includes(role)) {
            setError("Role must be customer or admin.");
            return;
        }
        await save(`/api/admin/users/${u.id}`, "PUT",
            { name, email: u.email, phone, role }, () => {});
    };

    const updateBooking = async (b, status) => {
        await save(`/api/admin/bookings/${b.id}`, "PATCH", { status }, () => {});
    };

    const screensForTheatre = useMemo(
        () => data.screens.filter(s => String(s.theatre_id) === String(show.theatre_id)),
        [data.screens, show.theatre_id]
    );

    const resetAll = () => {
        setEditing(null);
        setMovie(emptyMovie);
        setTheatre(emptyTheatre);
        setScreen(emptyScreen);
        setSeat(emptySeat);
        setShow(emptyShow);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    const navItems = [
        ["overview", "Overview"],
        ["users", "Users"],
        ["movies", "Movies"],
        ["theatres", "Theatres"],
        ["screens", "Screens"],
        ["seats", "Seats"],
        ["shows", "Shows"],
        ["bookings", "Bookings"],
        ["payments", "Payments"]
    ];

    if (loading) {
        return <div className="admin-loading"><img src={logo} alt="" /><h2>Loading administration panel...</h2></div>;
    }

    return (
        <div className="admin-page">
            <nav className="admin-navbar">
                <Link to="/home" className="admin-logo"><img src={logo} alt="Movie Ticket Booking" /></Link>
                <div className="admin-nav-links">
                    <Link to="/home">Home</Link>
                    <Link to="/my-bookings">My Bookings</Link>
                    <Link to="/admin-dashboard" className="active">Admin Dashboard</Link>
                    <div className="admin-profile-area">
                        <button
                            type="button"
                            className="admin-avatar"
                            title="Open profile"
                            onClick={() => setProfileOpen(open => !open)}
                        >
                            {initial}
                        </button>
                        {profileOpen && (
                            <div className="admin-profile-menu">
                                <div className="profile-menu-user">
                                    <div className="profile-avatar-large">{initial}</div>
                                    <div>
                                        <strong>{user?.name || "Admin"}</strong>
                                        <span>{user?.email || ""}</span>
                                    </div>
                                </div>
                                <div className="profile-role">Administrator</div>
                                <Link to="/my-bookings" onClick={() => setProfileOpen(false)}>My Bookings</Link>
                                <Link to="/home" onClick={() => setProfileOpen(false)}>Go to Home</Link>
                                <button type="button" onClick={logout}>Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="admin-content">
                <div className="admin-heading">
                    <div>
                        <p>ADMINISTRATION</p>
                        <h1>Control Center</h1>
                        <span>Manage users, movies, theatres, screens, seats, shows and bookings.</span>
                    </div>
                    <Link to="/home" className="admin-home-button">Go to Home</Link>
                </div>

                <div className="admin-tabs">
                    {navItems.map(([key, label]) => (
                        <button
                            key={key}
                            className={tab === key ? "active" : ""}
                            onClick={() => { setTab(key); setError(""); }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {notice && <div className="admin-notice">{notice}</div>}
                {error && (
                    <div className="admin-error">
                        <span>{error}</span>
                        <button onClick={() => setError("")}>×</button>
                    </div>
                )}

                {tab === "overview" && (
                    <>
                        <section className="stats-grid">
                            <Stat title="Total Users" value={stats.total_users ?? 0} icon="👥" />
                            <Stat title="Active Movies" value={stats.total_movies ?? 0} icon="🎬" />
                            <Stat title="Theatres" value={data.theatres.length} icon="🏢" />
                            <Stat title="Screens" value={data.screens.length} icon="▣" />
                            <Stat title="Shows" value={data.shows.filter(s => s.status === "active").length} icon="🕐" />
                            <Stat title="Total Bookings" value={stats.total_bookings ?? 0} icon="🎟️" />
                            <Stat title="Confirmed Revenue" value={`₹${Number(stats.total_revenue || 0).toFixed(2)}`} icon="₹" />
                        </section>

                        <section className="management-intro">
                            <h2>Admin Dashboard</h2>
                            <p>Use the tabs above to add, edit or remove system data.</p>
                            <div className="quick-grid">
                                {navItems.slice(1).map(([key, label]) => (
                                    <button key={key} onClick={() => setTab(key)}>{label}<span>→</span></button>
                                ))}
                            </div>
                        </section>

                        <section className="admin-bookings-section">
                            <div className="admin-section-header">
                                <div><p>BOOKING MANAGEMENT</p><h2>Recent Bookings</h2></div>
                                <button onClick={() => setTab("bookings")}>Manage Bookings</button>
                            </div>
                            <BookingTable bookings={data.bookings.slice(0, 8)} onStatus={updateBooking} />
                        </section>
                    </>
                )}

                {tab === "users" && (
                    <ManagementPanel title="User Management" subtitle="View and manage every registered account.">
                        <Table>
                            <thead><tr><th>ID</th><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                            <tbody>{data.users.map(u => (
                                <tr key={u.id}>
                                    <td>#{u.id}</td><td><strong>{u.name}</strong></td><td>{u.email}</td>
                                    <td>{u.phone || "-"}</td><td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                                    <td>{formatDate(u.created_at)}</td>
                                    <td className="actions">
                                        <button onClick={() => updateUser(u)}>Edit</button>
                                        <button className="danger" disabled={u.id === user.id} onClick={() => remove(`/api/admin/users/${u.id}`, `Delete ${u.name}?`)}>Delete</button>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </Table>
                    </ManagementPanel>
                )}

                {tab === "movies" && (
                    <ManagementPanel title="Movie Management" subtitle="Add new movies and control what customers see.">
                        <MovieForm
                            value={movie} setValue={setMovie}
                            editing={editing === "movie"}
                            onSubmit={() => save(editing === "movie" ? `/api/admin/movies/${movie.id}` : "/api/admin/movies", editing === "movie" ? "PUT" : "POST", movie, () => setMovie(emptyMovie))}
                            onCancel={resetAll}
                        />
                        <Table>
                            <thead><tr><th>Movie</th><th>Genre</th><th>Language</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>{data.movies.map(m => (
                                <tr key={m.id}><td><strong>{m.title}</strong><small>{m.director || "No director"}</small></td>
                                    <td>{m.genre || "-"}</td><td>{m.language || "-"}</td><td>{m.duration_minutes} min</td>
                                    <td><span className={`status-badge ${m.status}`}>{m.status}</span></td>
                                    <td className="actions">
                                        <button onClick={() => { setMovie({...m, release_date: m.release_date ? String(m.release_date).slice(0,10) : ""}); setEditing("movie"); window.scrollTo({top:0,behavior:"smooth"}); }}>Edit</button>
                                        {m.status === "active" && <button className="danger" onClick={() => remove(`/api/admin/movies/${m.id}`, `Deactivate ${m.title}?`)}>Deactivate</button>}
                                    </td>
                                </tr>
                            ))}</tbody>
                        </Table>
                    </ManagementPanel>
                )}

                {tab === "theatres" && (
                    <ManagementPanel title="Theatre Management" subtitle="Manage cinema locations and contact details.">
                        <SimpleForm title={editing === "theatre" ? "Edit Theatre" : "Add Theatre"} fields={[
                            ["name","Theatre Name"],["address","Address"],["city","City"],["contact","Contact"]
                        ]} value={theatre} setValue={setTheatre}
                            onSubmit={() => save(editing === "theatre" ? `/api/admin/theatres/${theatre.id}` : "/api/admin/theatres", editing === "theatre" ? "PUT":"POST", theatre, () => setTheatre(emptyTheatre))}
                            editing={editing === "theatre"} onCancel={resetAll}/>
                        <Table><thead><tr><th>Name</th><th>Address</th><th>City</th><th>Contact</th><th>Actions</th></tr></thead>
                            <tbody>{data.theatres.map(t => <tr key={t.id}><td><strong>{t.name}</strong></td><td>{t.address}</td><td>{t.city}</td><td>{t.contact || "-"}</td><td className="actions">
                                <button onClick={() => {setTheatre(t);setEditing("theatre");}}>Edit</button>
                                <button className="danger" onClick={() => remove(`/api/admin/theatres/${t.id}`, `Delete ${t.name}?`)}>Delete</button>
                            </td></tr>)}</tbody>
                        </Table>
                    </ManagementPanel>
                )}

                {tab === "screens" && (
                    <ManagementPanel title="Screen Management" subtitle="Create and manage screens inside each theatre.">
                        <ScreenForm value={screen} setValue={setScreen} theatres={data.theatres}
                            editing={editing === "screen"}
                            onSubmit={() => save(editing === "screen" ? `/api/admin/screens/${screen.id}` : "/api/admin/screens", editing === "screen" ? "PUT":"POST", screen, () => setScreen(emptyScreen))}
                            onCancel={resetAll}/>
                        <Table><thead><tr><th>Screen</th><th>Theatre</th><th>City</th><th>Capacity</th><th>Actions</th></tr></thead>
                            <tbody>{data.screens.map(s => <tr key={s.id}><td><strong>{s.name}</strong></td><td>{s.theatre_name}</td><td>{s.city}</td><td>{s.seat_capacity}</td><td className="actions">
                                <button onClick={() => {setScreen(s);setEditing("screen");}}>Edit</button>
                                <button className="danger" onClick={() => remove(`/api/admin/screens/${s.id}`, `Delete ${s.name}?`)}>Delete</button>
                            </td></tr>)}</tbody>
                        </Table>
                    </ManagementPanel>
                )}

                {tab === "seats" && (
                    <ManagementPanel title="Seat Management" subtitle="Create, price and activate individual seats.">
                        <SeatForm value={seat} setValue={setSeat} screens={data.screens}
                            editing={editing === "seat"}
                            onSubmit={() => save(editing === "seat" ? `/api/admin/seats/${seat.id}` : "/api/admin/seats", editing === "seat" ? "PUT":"POST", seat, () => setSeat(emptySeat))}
                            onCancel={resetAll}/>
                        <Table><thead><tr><th>Seat</th><th>Screen</th><th>Theatre</th><th>Type</th><th>Multiplier</th><th>Active</th><th>Actions</th></tr></thead>
                            <tbody>{data.seats.map(s => <tr key={s.id}><td><strong>{s.seat_number}</strong></td><td>{s.screen_name}</td><td>{s.theatre_name}</td><td>{s.seat_type}</td><td>{Number(s.price_multiplier).toFixed(2)}×</td><td>{s.is_active ? "Yes":"No"}</td><td className="actions">
                                <button onClick={() => {setSeat({...s, is_active: Boolean(s.is_active)});setEditing("seat");}}>Edit</button>
                                <button className="danger" onClick={() => remove(`/api/admin/seats/${s.id}`, `Delete seat ${s.seat_number}?`)}>Delete</button>
                            </td></tr>)}</tbody>
                        </Table>
                    </ManagementPanel>
                )}

                {tab === "shows" && (
                    <ManagementPanel title="Show Management" subtitle="Schedule movies on specific theatre screens and set ticket prices.">
                        <ShowForm value={show} setValue={setShow} movies={data.movies.filter(m => m.status === "active")}
                            theatres={data.theatres} screens={data.screens}
                            editing={editing === "show"}
                            onSubmit={() => save(editing === "show" ? `/api/admin/shows/${show.id}` : "/api/admin/shows", editing === "show" ? "PUT":"POST", show, () => setShow(emptyShow))}
                            onCancel={resetAll}/>
                        <Table><thead><tr><th>Movie</th><th>Theatre / Screen</th><th>Date</th><th>Time</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>{data.shows.map(s => <tr key={s.id}><td><strong>{s.movie_title}</strong></td><td>{s.theatre_name}<small>{s.screen_name}</small></td>
                                <td>{formatDate(s.show_date)}</td><td>{String(s.start_time).slice(0,5)} - {String(s.end_time).slice(0,5)}</td><td>₹{Number(s.base_price).toFixed(2)}</td>
                                <td><span className={`status-badge ${s.status}`}>{s.status}</span></td><td className="actions">
                                    <button onClick={() => {setShow({...s, show_date:String(s.show_date).slice(0,10), start_time:String(s.start_time).slice(0,5), end_time:String(s.end_time).slice(0,5)});setEditing("show");}}>Edit</button>
                                    {s.status === "active" && <button className="danger" onClick={() => remove(`/api/admin/shows/${s.id}`, "Cancel this show?")}>Cancel</button>}
                                </td></tr>)}</tbody>
                        </Table>
                    </ManagementPanel>
                )}

                {tab === "bookings" && (
                    <ManagementPanel title="Booking Management" subtitle="View every customer reservation and change its status.">
                        <BookingTable bookings={data.bookings} onStatus={updateBooking} full />
                    </ManagementPanel>
                )}
                {tab === "payments" && (
                    <ManagementPanel title="Payment Records" subtitle="View payment transactions linked to customer bookings. Payment records are kept read-only here.">
                        {data.payments.length === 0 ? (
                            <div className="admin-empty"><div>₹</div><h3>No payments yet</h3><p>Successful and pending payment records will appear here.</p></div>
                        ) : (
                            <Table>
                                <thead><tr><th>Transaction</th><th>Booking</th><th>Customer</th><th>Method</th><th>Amount</th><th>Status</th><th>Paid At</th></tr></thead>
                                <tbody>{data.payments.map(p => (
                                    <tr key={p.id}>
                                        <td><strong>{p.transaction_id}</strong></td>
                                        <td>{p.booking_code}</td>
                                        <td><strong>{p.customer_name}</strong><small>{p.customer_email}</small></td>
                                        <td>{p.payment_method}</td>
                                        <td>₹{Number(p.amount || 0).toFixed(2)}</td>
                                        <td><span className={`status-badge ${p.payment_status}`}>{p.payment_status}</span></td>
                                        <td>{p.paid_at ? formatDate(p.paid_at) : "-"}</td>
                                    </tr>
                                ))}</tbody>
                            </Table>
                        )}
                    </ManagementPanel>
                )}
            </main>
        </div>
    );
}

function Stat({title,value,icon}) {
    return <div className="stat-card"><div className="stat-icon">{icon}</div><div><span>{title}</span><strong>{value}</strong></div></div>;
}

function ManagementPanel({title,subtitle,children}) {
    return <section className="management-panel"><div className="panel-heading"><div><p>MANAGEMENT</p><h2>{title}</h2><span>{subtitle}</span></div></div>{children}</section>;
}

function Table({children}) { return <div className="admin-table-wrap"><table className="admin-table">{children}</table></div>; }

function MovieForm({value,setValue,editing,onSubmit,onCancel}) {
    const f = (key,label,type="text") => <label><span>{label}</span><input type={type} value={value[key] ?? ""} onChange={e=>setValue({...value,[key]:e.target.value})} /></label>;
    return <div className="entity-form wide"><div className="form-title">{editing?"Edit Movie":"Add Movie"}</div>
        <div className="form-grid">
            {f("title","Title *")}{f("genre","Genre")}{f("language","Language")}{f("duration_minutes","Duration (minutes)","number")}
            {f("release_date","Release Date","date")}{f("certificate","Certificate")}{f("director","Director")}
            {f("poster_url","Poster URL")}{f("trailer_url","Trailer URL")}
            <label><span>Status</span><select value={value.status} onChange={e=>setValue({...value,status:e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
            {f("cast","Cast")}
            <label className="span-2"><span>Description</span><textarea rows="3" value={value.description ?? ""} onChange={e=>setValue({...value,description:e.target.value})}/></label>
        </div><FormButtons editing={editing} onSubmit={onSubmit} onCancel={onCancel}/>
    </div>;
}

function SimpleForm({title,fields,value,setValue,onSubmit,editing,onCancel}) {
    return <div className="entity-form"><div className="form-title">{title}</div><div className="form-grid">{fields.map(([key,label])=>
        <label key={key}><span>{label}</span><input value={value[key] ?? ""} onChange={e=>setValue({...value,[key]:e.target.value})} required={key!=="contact"}/></label>)}</div><FormButtons editing={editing} onSubmit={onSubmit} onCancel={onCancel}/></div>;
}

function ScreenForm({value,setValue,theatres,editing,onSubmit,onCancel}) {
    return <div className="entity-form"><div className="form-title">{editing?"Edit Screen":"Add Screen"}</div><div className="form-grid">
        <label><span>Theatre</span><select value={value.theatre_id ?? ""} onChange={e=>setValue({...value,theatre_id:e.target.value})} required><option value="">Select theatre</option>{theatres.map(t=><option key={t.id} value={t.id}>{t.name} — {t.city}</option>)}</select></label>
        <label><span>Screen Name</span><input value={value.name ?? ""} onChange={e=>setValue({...value,name:e.target.value})} required /></label>
        <label><span>Seat Capacity</span><input type="number" min="0" value={value.seat_capacity ?? 0} onChange={e=>setValue({...value,seat_capacity:e.target.value})}/></label>
    </div><FormButtons editing={editing} onSubmit={onSubmit} onCancel={onCancel}/></div>;
}

function SeatForm({value,setValue,screens,editing,onSubmit,onCancel}) {
    return <div className="entity-form"><div className="form-title">{editing?"Edit Seat":"Add Seat"}</div><div className="form-grid">
        <label><span>Screen</span><select value={value.screen_id ?? ""} onChange={e=>setValue({...value,screen_id:e.target.value})} required><option value="">Select screen</option>{screens.map(s=><option key={s.id} value={s.id}>{s.theatre_name} / {s.name}</option>)}</select></label>
        <label><span>Seat Number</span><input value={value.seat_number ?? ""} onChange={e=>setValue({...value,seat_number:e.target.value.toUpperCase()})} required /></label>
        <label><span>Seat Type</span><select value={value.seat_type} onChange={e=>setValue({...value,seat_type:e.target.value})}><option value="regular">Regular</option><option value="premium">Premium</option><option value="vip">VIP</option></select></label>
        <label><span>Price Multiplier</span><input type="number" step="0.01" min="0.01" value={value.price_multiplier} onChange={e=>setValue({...value,price_multiplier:e.target.value})}/></label>
        <label className="checkbox"><input type="checkbox" checked={Boolean(value.is_active)} onChange={e=>setValue({...value,is_active:e.target.checked})}/><span>Seat active</span></label>
    </div><FormButtons editing={editing} onSubmit={onSubmit} onCancel={onCancel}/></div>;
}

function ShowForm({value,setValue,movies,theatres,screens,editing,onSubmit,onCancel}) {
    const availableScreens = screens.filter(s=>!value.theatre_id || String(s.theatre_id)===String(value.theatre_id));
    return <div className="entity-form wide"><div className="form-title">{editing?"Edit Show":"Add Show"}</div><div className="form-grid">
        <label><span>Movie</span><select value={value.movie_id ?? ""} onChange={e=>setValue({...value,movie_id:e.target.value})} required><option value="">Select movie</option>{movies.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select></label>
        <label><span>Theatre</span><select value={value.theatre_id ?? ""} onChange={e=>setValue({...value,theatre_id:e.target.value,screen_id:""})} required><option value="">Select theatre</option>{theatres.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        <label><span>Screen</span><select value={value.screen_id ?? ""} onChange={e=>setValue({...value,screen_id:e.target.value})} required><option value="">Select screen</option>{availableScreens.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label><span>Show Date</span><input type="date" value={value.show_date ?? ""} onChange={e=>setValue({...value,show_date:e.target.value})} required/></label>
        <label><span>Start Time</span><input type="time" value={value.start_time ?? ""} onChange={e=>setValue({...value,start_time:e.target.value})} required/></label>
        <label><span>End Time</span><input type="time" value={value.end_time ?? ""} onChange={e=>setValue({...value,end_time:e.target.value})} required/></label>
        <label><span>Base Ticket Price</span><input type="number" min="0" step="0.01" value={value.base_price ?? ""} onChange={e=>setValue({...value,base_price:e.target.value})} required/></label>
        <label><span>Status</span><select value={value.status} onChange={e=>setValue({...value,status:e.target.value})}><option value="active">Active</option><option value="cancelled">Cancelled</option></select></label>
    </div><FormButtons editing={editing} onSubmit={onSubmit} onCancel={onCancel}/></div>;
}

function FormButtons({editing,onSubmit,onCancel}) {
    return <div className="form-actions"><button type="button" onClick={onSubmit}>{editing?"Save Changes":"Add"}</button>{editing && <button type="button" className="secondary" onClick={onCancel}>Cancel</button>}</div>;
}

function BookingTable({bookings,onStatus,full=false}) {
    if (!bookings.length) return <div className="admin-empty"><div>🎟️</div><h3>No bookings yet</h3><p>Bookings will appear here when customers make reservations.</p></div>;
    return <Table><thead><tr><th>Booking</th><th>Customer</th><th>Movie</th><th>Theatre</th><th>Date / Time</th><th>Amount</th><th>Status</th><th>Manage</th></tr></thead>
        <tbody>{bookings.map(b=><tr key={b.id}><td><strong>{b.booking_code}</strong></td><td><strong>{b.customer_name}</strong><small>{b.customer_email}</small></td>
            <td>{b.movie_title}</td><td>{b.theatre_name}<small>{b.city}</small></td><td>{formatDate(b.show_date)}<small>{String(b.start_time || "").slice(0,5)}</small></td>
            <td>₹{Number(b.total_amount||0).toFixed(2)}</td><td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
            <td><select className="status-select" value={b.status} onChange={e=>onStatus(b,e.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option></select></td>
        </tr>)}</tbody></Table>;
}

function formatDate(value) {
    if (!value) return "-";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value).slice(0,10) : d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
}

export default AdminDashboard;
