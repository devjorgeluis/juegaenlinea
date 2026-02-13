import { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutContext } from "./LayoutContext";
import { AppContext } from "../../AppContext";
import { callApi } from "../../utils/Utils";
// import SearchInput from "../SearchInput";
import ImgHome from "/src/assets/svg/home.svg";
import ImgCasino from "/src/assets/svg/casino.svg";
import ImgLiveCasino from "/src/assets/svg/live-casino.svg";
import ImgSports from "/src/assets/svg/sports.svg";
import ImgLiveSports from "/src/assets/img/deslizalo.png";
import ImgTime from "/src/assets/img/time-animate2.png";
import ImgLogin from "/src/assets/svg/login.svg";

// import ImgMobileCircleSport from "/src/assets/svg/mobile-circle-sport.svg";
// import ImgMobileCircleLiveSport from "/src/assets/svg/mobile-circle-blue-sport.svg";
// import ImgMobileLogo from "/src/assets/svg/mobile-logo.svg";
// import ImgMobileHome from "/src/assets/svg/mobile-home.svg";
// import ImgMobileCasino from "/src/assets/svg/mobile-casino.svg";
// import ImgMobileLiveCasino from "/src/assets/svg/mobile-live-casino.svg";
// import ImgMobileSports from "/src/assets/svg/mobile-sports.svg";
// import ImgArrowLeft from "/src/assets/svg/arrow-left.svg";
// import ImgSearch from "/src/assets/svg/search.svg";
import ImgPhone from "/src/assets/svg/phone.svg";

const MobileFooter = ({
    isSlotsOnly,
    isLogin,
    isMobile,
    supportParent,
    openSupportModal,
    handleLogoutClick,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isSidebarExpanded, toggleSidebar, setShowMobileSearch } = useContext(LayoutContext);
    const { contextData } = useContext(AppContext);

    const [expandedMenus, setExpandedMenus] = useState([]);
    const [liveCasinoMenus, setLiveCasinoMenus] = useState([]);
    const [hasFetchedLiveCasino, setHasFetchedLiveCasino] = useState(false);
    const [games, setGames] = useState([]);
    const [txtSearch, setTxtSearch] = useState("");
    const [searchDelayTimer, setSearchDelayTimer] = useState();
    const searchRef = useRef(null);
    const [isLoadingGames, setIsLoadingGames] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);

    const isSlotsOnlyMode = isSlotsOnly === true || isSlotsOnly === "true";
    const isMenuExpanded = (menuId) => expandedMenus.includes(menuId);

    useEffect(() => {
        setIsSearchActive(txtSearch.trim() !== "");
    }, [txtSearch]);

    const handleNavigation = (item) => () => {
        if (item.action) {
            item.action();
        } else if (item.href !== "#") {
            navigate(item.href);
        }
        if (isSidebarExpanded) {
            toggleSidebar();
        }
    };

    const handleSimpleNavigation = (path) => () => {
        navigate(path);
        if (isSidebarExpanded) {
            toggleSidebar();
        }
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

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

    const showFullMenu = isSlotsOnly === "false" || isSlotsOnly === false;

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
            subItems: [
                { name: "Lobby", href: "/casino#home", image: "fa-solid fa-crown" },
                { name: "Juegos Nuevos", href: "/casino#hot", image: "fa-solid fa-fire" },
                { name: "Jokers", href: "/casino#joker", image: "fa-solid fa-diamond" },
                { name: "Juegos de Crash", href: "/casino#arcade", image: "fa-solid fa-gamepad" },
                { name: "Megaways", href: "/casino#megaways", image: "fa-solid fa-dice" },
                { name: "Ruletas", href: "/casino#roulette", image: "fa-solid fa-trophy" },
            ],
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
                    href: "/live-sports"
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

    const isBottomNavActive = (path) => {
        const currentPath = location.pathname;
        
        if (path === "/casino" && currentPath === "/casino") {
            return true;
        }
        
        return currentPath === path;
    };

    return (
        <>
            <div className="navbar-mobile">
                <div className="navbar-mobile-ex">
                    <div className="nav-mobile-item">
                        <a className="btn-action-sidebar"><i className="fa-solid fa-bars"></i><span className="title">Menú</span></a>
                    </div>
                    <div className="nav-mobile-item">
                        <a onClick={() => navigate("/casino")} className="active">
                            <img src={ImgCasino} width="20px" /><span className="title">Casino</span>
                        </a>
                    </div>
                    <div className="nav-mobile-item">
                        <a onClick={() => navigate("/")} className="a-special">
                            <span className="icon-scale">
                                <img src={ImgHome} width="30px" />
                            </span>
                            <img src={ImgHome} width="20px" />
                            <span className="title">Inicio</span>
                        </a>
                    </div>
                    <div className="nav-mobile-item">
                        <a onClick={() => navigate("/login")}>
                            <img src={ImgLogin} width="20px" /><span className="title">Ingresar</span>
                        </a>
                    </div>
                    <div className="nav-mobile-item">
                        <a onClick={() => navigate("sports")}>
                            <img src={ImgSports} width="20px" /><span className="title">Deportes</span>
                        </a>
                    </div>
                </div>
            </div>


            {/* {isSidebarExpanded && (
                <div className="sc-gvsNSq jxqyxT cy-main-nav open-menu">
                    <div className="sc-daLoug sc-dXijah hUcPdj bDBgJW">
                        <div className="sc-codVKW bPGlzn">
                            <div className="sc-fEyyHY cwRgmi">
                                <div className="sc-etyUPJ gNGgmX cy-close-mobile-menu-icon">
                                    <img src={ImgArrowLeft} onClick={toggleSidebar} style={{ cursor: 'pointer' }} />
                                </div>
                            </div>
                            <div className="sc-fEyyHY cwRgmi">
                                <div className="sc-yWEwC sc-bvtzcD cOhCUT bwJqBY cy-logo-container">
                                    <a onClick={handleSimpleNavigation("/")} className="sc-ciMfCw ja-dRuB" style={{ cursor: 'pointer' }}>
                                        <img src={ImgMobileLogo} className="sc-gHXKQl eKXwKk logo cy-logo" />
                                    </a>
                                </div>
                            </div>
                            <div className="sc-fEyyHY cwRgmi"></div>
                        </div>
                        <div className="sc-hhFrFd bCsUbK">
                            <div className="sc-gSONCE sc-dxYMJA fxKZYg gpHIWH">
                                <div className="sc-iYjPCr gWmbXn cy-side-menu">
                                    <div className="sc-gKjrUP ieYZAJ cy-menu-links-group cy-menu-links-cross-brands-group">
                                        <li className="sc-kIfdec jmRoun cy-menu-item">
                                            <a onClick={handleSimpleNavigation("/sports")} className="sc-ciMfCw ja-dRuB" style={{ cursor: 'pointer' }}>
                                                <div className="sc-cAeysB fHjzIS">
                                                    <div className="sc-dGzCaO bRZDKe">
                                                        <img src={ImgMobileCircleSport} />
                                                    </div>
                                                    <span className="sc-KeRuP fuWdtC">Deportes</span>
                                                </div>
                                            </a>
                                        </li>
                                        <li className="sc-kIfdec jmRoun cy-menu-item">
                                            <a onClick={handleSimpleNavigation("/live-sports")} className="sc-ciMfCw ja-dRuB" style={{ cursor: 'pointer' }}>
                                                <div className="sc-cAeysB fPYrue">
                                                    <div className="sc-dGzCaO bRZDKe">
                                                        <img src={ImgMobileCircleLiveSport} />
                                                    </div>
                                                    <span className="sc-KeRuP fuWdtC">En Vivo</span>
                                                </div>
                                            </a>
                                        </li>
                                    </div>
                                    {!isSearchActive && (
                                        <section className="sc-klCKcm sc-kZzZex eLAEaM jdUfX">
                                            <div className="sc-MKQME sc-jlirRl ekPQQx fJgckN">
                                                <ul className="cy-menu-links-group">
                                                    {menuItems.map((item, index) => {
                                                        const isActive = isMenuActive(item);
                                                        const isLast = index === menuItems.length - 1;

                                                        return (
                                                            <div key={item.id}>
                                                                <li className="sc-fkVSuP sc-bsyrka izPQbG kxFylD cy-menu-item">
                                                                    <a onClick={handleNavigation(item)} className="sc-ciMfCw ja-dRuB" style={{ cursor: 'pointer' }}>
                                                                        <div className={`sc-gPLYmt sc-cjShfW efmGEW bDGwEc ${isActive ? "dtqOUd" : ""}`}>
                                                                            <span className="sc-iDhmSy jagTrD"></span>
                                                                            <div className={`sc-dgWXKx sc-bsStmr dvyXko hWgsTC ${isLast ? "phone" : ""}`}>
                                                                                <img src={item.image} className="sc-bqOBqt PBviZ" alt={item.name} />
                                                                            </div>
                                                                            <span className="sc-bMhjqq sc-kfiijn eeQnce gwhmuu">{item.name}</span>
                                                                        </div>
                                                                    </a>
                                                                </li>
                                                                <div className="sc-cLVYFp sc-kiUgTw cSIQFP hPFZit"></div>
                                                            </div>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )} */}
        </>
    );
};

export default MobileFooter;