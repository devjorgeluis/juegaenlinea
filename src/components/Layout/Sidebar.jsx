import { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../AppContext";
import ImgLogo from "/src/assets/img/logo.png";
import ImgHome from "/src/assets/svg/home.svg";
import ImgCasino from "/src/assets/svg/casino.svg";
import ImgLiveCasino from "/src/assets/svg/live-casino.svg";
import ImgSports from "/src/assets/svg/sports.svg";
import ImgLiveSports from "/src/assets/img/deslizalo.png";
import ImgTime from "/src/assets/img/time-animate2.png";
import ImgPhone from "/src/assets/svg/phone.svg";

const Sidebar = ({ isSlotsOnly, isLogin, isMobile, supportParent, openSupportModal, isUserMenuOpen, setIsUserMenuOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { contextData } = useContext(AppContext);
    const [expandedMenus, setExpandedMenus] = useState([]);
    const iconRefs = useRef({});
    const isMenuExpanded = (menuId) => expandedMenus.includes(menuId);
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        const currentPath = location.pathname;
        const hash = location.hash.slice(1);

        if (currentPath.startsWith("/live-casino") && hash && !isMenuExpanded("live-casino")) {
            setExpandedMenus((prev) => [...prev, "live-casino"]);
        }

        if (currentPath.startsWith("/profile") && !isMenuExpanded("profile")) {
            setExpandedMenus((prev) => [...prev, "profile"]);
        }
    }, [location.pathname, location.hash]);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'P.M.' : 'A.M.';
            
            hours = hours % 12;
            hours = hours ? hours : 12;
            const formattedHours = hours.toString().padStart(2, '0');
            
            setCurrentTime(`${formattedHours}:${minutes} ${ampm}`);
        };

        updateTime();

        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, []);

    const isSlotsOnlyMode = isSlotsOnly === true || isSlotsOnly === "true";

    const menuItems = [
        {
            id: "home",
            name: "Inicio",
            image: ImgHome,
            href: "/",
        },
        {
            id: "casino",
            name: "Casino",
            image: ImgCasino,
            href: "/casino",
        },
        ...(isSlotsOnlyMode
            ? []
            : [
                {
                    id: "live-casino",
                    name: "Casino en vivo",
                    image: ImgLiveCasino,
                    href: "/live-casino",
                },
                {
                    id: "sports",
                    name: "Deportes",
                    image: ImgSports,
                    href: "/sports",
                },
                {
                    id: "live-sports",
                    name: "Deportes en vivo",
                    image: ImgLiveSports,
                    href: "/live-sports",
                },
            ]),
        ...(supportParent
            ? [
                {
                    id: "support",
                    name: "Contactá a Tu Cajero",
                    image: ImgPhone,
                    href: "#",
                    action: () => {
                        openSupportModal(true);
                    },
                },
            ]
            : []),
    ];

    const isMenuActive = (item) => {
        const currentPath = location.pathname;
        const currentHash = location.hash;

        if (item.href.includes("#")) {
            return location.pathname + location.hash === item.href;
        }

        if (item.id === "profile" && currentPath.startsWith("/profile")) {
            return true;
        }

        if (item.href === currentPath && !currentHash) {
            return true;
        }

        return false;
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const closeUserMenu = () => {
        setIsUserMenuOpen(false);
    };

    const handleMenuClick = (href, item) => {
        closeUserMenu();
        console.log(item);

        if (item && item.action) {
            item.action();
        } else {
            navigate(href);
        }
    };

    const handleHamburgerClick = () => {
        document.body.classList.toggle('sideDiff');
    };

    return (
        <>
            <div className="sidebar">
                <div className="sidebar-head d-flex">
                    <button className="btn btn-sidebar btn-action-sidebar" onClick={() => handleHamburgerClick()}>
                        <i className="fa-solid fa-bars"></i>
                    </button>

                    <a
                        onClick={() => navigate("/")}
                        className="sidebar-logo"
                    >
                        <img alt="" src={ImgLogo} />
                    </a>
                </div>

                <div className="sidebar-body">
                    <div className="sidebar-body-ex">
                        <div className="sidebar-title">
                            <span className="icon">
                                <i className="fa-solid fa-bolt back"></i>
                                <i className="fa-solid fa-bolt front"></i>
                            </span>
                            Panel
                        </div>

                        <div className="sidebar-item-list">
                            <div>
                                {menuItems.map((item, index) => {
                                    const itemRef = (el) => (iconRefs.current[item.id] = el);
                                    const isActive = isMenuActive(item);

                                    return (
                                        <div className="sidebar-item" ref={itemRef} key={item.id}>
                                            <a
                                                onClick={() => handleMenuClick(item.href, item)}
                                                className={`btn ${isActive ? "btn-featured" : ""}`}
                                            >
                                                <span className="sidebar-item-icon">
                                                    <img src={item.image} />
                                                </span>
                                                <span className="sidebar-item-name">{item.name}</span>
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <hr />

                        <div className="sidebar-extra">
                            <div className="sidebar-time">
                                <div className="sidebar-time-ex">
                                    <div className="sidebar-time-figure">
                                        <img src={ImgTime} />
                                    </div>

                                    <div className="sidebar-time-text">
                                        <span className="span">{currentTime}</span>
                                    </div>
                                </div>

                                <p className="mt-1">Hora local</p>
                            </div>

                            <div className="sidebar-social">
                                <a
                                    href="https://www.instagram.com/juegaenlinea/"
                                    target="_blank"
                                >
                                    <i className="fa-brands fa-instagram"></i>
                                </a>

                                <a
                                    href="https://www.facebook.com/juegaenlineacom/"
                                    target="_blank"
                                >
                                    <i className="fa-brands fa-facebook"></i>
                                </a>

                                <p>Síguenos en redes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;