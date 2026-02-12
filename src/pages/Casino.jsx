import { useContext, useState, useEffect, useRef } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { AppContext } from "../AppContext";
import { LayoutContext } from "../components/Layout/LayoutContext";
import { NavigationContext } from "../components/Layout/NavigationContext";
import { callApi } from "../utils/Utils";
import Footer from "../components/Layout/Footer";
import GameCard from "/src/components/GameCard";
import Slideshow from "../components/Casino/Slideshow";
import HotGameSlideshow from "../components/Home/HotGameSlideshow";
import GameModal from "../components/Modal/GameModal";
import LoadApi from "../components/Loading/LoadApi";
import LoginModal from "../components/Modal/LoginModal";
import ProviderContainer from "../components/ProviderContainer";

let selectedGameId = null;
let selectedGameType = null;
let selectedGameLauncher = null;
let selectedGameName = null;
let selectedGameImg = null;
let pageCurrent = 0;

const Casino = () => {
  const pageTitle = "Casino";
  const { contextData } = useContext(AppContext);
  const { isLogin, txtSearch, setTxtSearch, searchGames, setSearchGames, setIsProviderSelected } = useContext(LayoutContext);
  const { setShowFullDivLoading } = useContext(NavigationContext);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [tags, setTags] = useState([]);
  const [games, setGames] = useState([]);
  const [firstFiveCategoriesGames, setFirstFiveCategoriesGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState({});
  const [categoryType, setCategoryType] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [pageData, setPageData] = useState({});
  const [gameUrl, setGameUrl] = useState("");
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [shouldShowGameModal, setShouldShowGameModal] = useState(false);
  const [isSingleCategoryView, setIsSingleCategoryView] = useState(false);
  const refGameModal = useRef();
  const location = useLocation();
  const { isSlotsOnly, isMobile } = useOutletContext();

  const pendingCategoryFetchesRef = useRef(0);
  const isLoadingMainCategoriesRef = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentPath = window.location.pathname;

        if (currentPath === '/casino' || currentPath.startsWith('/casino')) {
          setShowFullDivLoading(true);

          selectedGameId = null;
          selectedGameType = null;
          selectedGameLauncher = null;
          selectedGameName = null;
          selectedGameImg = null;
          setGameUrl("");
          setShouldShowGameModal(false);
          setActiveCategory({});
          setIsSingleCategoryView(false);

          getPage("casino");
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!location.hash || tags.length === 0) {
      if (!location.hash && tags.length > 0) {
        getPage("casino");
      }
      return;
    }

    const hashCode = location.hash.replace('#', '');
    const tagIndex = tags.findIndex(t => t.code === hashCode);

    if (tagIndex !== -1) {
      setSelectedCategoryIndex(tagIndex);
      setIsSingleCategoryView(false);
      getPage(hashCode);
    }
  }, [location.hash, tags]);

  useEffect(() => {
    selectedGameId = null;
    selectedGameType = null;
    selectedGameLauncher = null;
    selectedGameName = null;
    selectedGameImg = null;
    setGameUrl("");
    setShouldShowGameModal(false);
    setActiveCategory({});
    setIsSingleCategoryView(false);

    if (!location.hash) {
      getPage("casino");
    }

    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const isSlotsOnlyFalse = isSlotsOnly === false || isSlotsOnly === "false";
    let tmpTags = isSlotsOnlyFalse
      ? [
        { name: "Lobby", code: "home" },
        { name: "Juegos Nuevos", code: "hot" },
        { name: "Jokers", code: "joker" },
        { name: "Juegos de crash", code: "arcade" },
        { name: "Megaways", code: "megaways" },
        { name: "Ruletas", code: "roulette" },
      ]
      : [
        { name: "Lobby", code: "home" },
        { name: "Juegos Nuevos", code: "hot" },
        { name: "Jokers", code: "joker" },
        { name: "Megaways", code: "megaways" },
      ];

    setTags(tmpTags);
  }, [isSlotsOnly]);

  useEffect(() => {
    if (mainCategories.length === 0 && !isLoadingMainCategoriesRef.current) {
      isLoadingMainCategoriesRef.current = true;
      setTimeout(() => {
        callApi(contextData, "GET", "/get-page?page=home", (result) => {
          isLoadingMainCategoriesRef.current = false;
          if (result.status !== 500 && result.status !== 422) {
            if (result.data && result.data.categories && result.data.categories.length > 0) {
              setMainCategories(result.data.categories);
              setCategories(result.data.categories);
            }
          }
        }, null);
      }, 1000);
    }
  }, []);

  const getPage = (page) => {
    setIsLoadingGames(true);
    setGames([]);
    setFirstFiveCategoriesGames([]);
    setIsSingleCategoryView(false);
    callApi(contextData, "GET", "/get-page?page=" + page, (result) => callbackGetPage(result, page), null);
  };

  const callbackGetPage = (result, page) => {
    if (result.status === 500 || result.status === 422) {

    } else {
      setCategoryType(result.data.page_group_type);
      setSelectedProvider(null);
      setPageData(result.data);

      const hashCode = location.hash.replace('#', '');
      const tagIndex = tags.findIndex(t => t.code === hashCode);
      setSelectedCategoryIndex(tagIndex !== -1 ? tagIndex : 0);

      if (result.data && result.data.page_group_type === "categories" && result.data.categories && result.data.categories.length > 0) {
        setCategories(result.data.categories);

        if (page === "casino" || page === "home") {
          setMainCategories(result.data.categories);
        }

        const firstCategory = result.data.categories[0];
        setActiveCategory(firstCategory);

        const firstFiveCategories = result.data.categories.slice(0, 5);
        if (firstFiveCategories.length > 0) {
          setFirstFiveCategoriesGames([]);
          pendingCategoryFetchesRef.current = firstFiveCategories.length;
          setIsLoadingGames(true);
          firstFiveCategories.forEach((item, index) => {
            fetchContentForCategory(item, item.id, item.table_name, index, true, result.data.page_group_code);
          });
        }
      } else if (result.data && result.data.page_group_type === "games") {
        setIsSingleCategoryView(true);

        setCategories(mainCategories.length > 0 ? mainCategories : []);

        configureImageSrc(result);
        setGames(result.data.categories || []);
        setActiveCategory(tags[tagIndex] || { name: page });
        pageCurrent = 1;
      }

      setShowFullDivLoading(false);
      setIsLoadingGames(false);
    }
  };

  const fetchContentForCategory = (category, categoryId, tableName, categoryIndex, resetCurrentPage, pageGroupCode = null) => {
    const pageSize = 12;
    const groupCode = pageGroupCode || pageData.page_group_code;

    const apiUrl =
      "/get-content?page_group_type=categories&page_group_code=" +
      groupCode +
      "&table_name=" +
      tableName +
      "&apigames_category_id=" +
      categoryId +
      "&page=0&length=" +
      pageSize +
      (selectedProvider && selectedProvider.id ? "&provider=" + selectedProvider.id : "");

    callApi(contextData, "GET", apiUrl, (result) => callbackFetchContentForCategory(result, category, categoryIndex), null);
  };

  const callbackFetchContentForCategory = (result, category, categoryIndex) => {
    if (result.status === 500 || result.status === 422) {

    } else {
      const content = result.content || [];
      configureImageSrc(result);

      const gamesWithImages = content.map((game) => ({
        ...game,
        imageDataSrc: game.image_local !== null ? contextData.cdnUrl + game.image_local : game.image_url,
      }));

      const categoryGames = {
        category: category,
        games: gamesWithImages,
      };

      setFirstFiveCategoriesGames((prev) => {
        const updated = [...prev];
        updated[categoryIndex] = categoryGames;
        return updated;
      });
    }

    pendingCategoryFetchesRef.current = Math.max(0, pendingCategoryFetchesRef.current - 1);
    if (pendingCategoryFetchesRef.current === 0) {
      setIsLoadingGames(false);
    }
  };

  const loadMoreGames = () => {
    if (!activeCategory) return;
    fetchContent(activeCategory, activeCategory.id, activeCategory.table_name, selectedCategoryIndex, false);
  };

  const fetchContent = (category, categoryId, tableName, categoryIndex, resetCurrentPage, pageGroupCode) => {
    let pageSize = 500;
    setIsLoadingGames(true);

    if (resetCurrentPage) {
      pageCurrent = 0;
      setGames([]);
    }

    setActiveCategory(category);
    setSelectedCategoryIndex(categoryIndex);

    const groupCode = categoryType === "categories" ? pageGroupCode || pageData.page_group_code : "default_pages_home"

    let apiUrl =
      "/get-content?page_group_type=categories&page_group_code=" +
      groupCode +
      "&table_name=" +
      tableName +
      "&apigames_category_id=" +
      categoryId +
      "&page=" +
      pageCurrent +
      "&length=" +
      pageSize;

    if (selectedProvider && selectedProvider.id) {
      apiUrl += "&provider=" + selectedProvider.id;
    }

    callApi(contextData, "GET", apiUrl, callbackFetchContent, null);
  };

  const callbackFetchContent = (result) => {
    if (result.status === 500 || result.status === 422) {
      setIsLoadingGames(false);
    } else {
      configureImageSrc(result);
      const newGames = result.content || [];

      if (pageCurrent === 0) {
        setGames(newGames);
        // ALWAYS set search games immediately
        setSearchGames(newGames);
      } else {
        setGames((prevGames) => [...prevGames, ...newGames]);
        // Also update search games for pagination
        setSearchGames((prevGames) => [...prevGames, ...newGames]);
      }

      if (newGames.length > 0) {
        pageCurrent += 1;
      }
    }
    setIsLoadingGames(false);
  };

  const configureImageSrc = (result) => {
    (result.content || []).forEach((element) => {
      element.imageDataSrc = element.image_local !== null ? contextData.cdnUrl + element.image_local : element.image_url;
    });
  };

  const launchGame = (game, type, launcher) => {
    setShouldShowGameModal(true);
    setShowFullDivLoading(true);
    setActiveCategory(null);
    selectedGameId = game.id != null ? game.id : selectedGameId;
    selectedGameType = type != null ? type : selectedGameType;
    selectedGameLauncher = launcher != null ? launcher : selectedGameLauncher;
    selectedGameName = game?.name;
    selectedGameImg = game?.image_local != null ? contextData.cdnUrl + game?.image_local : game.image_url;
    callApi(contextData, "GET", "/get-game-url?game_id=" + selectedGameId, callbackLaunchGame, null);
  };

  const callbackLaunchGame = (result) => {
    setShowFullDivLoading(false);
    if (result.status == "0") {
      switch (selectedGameLauncher) {
        case "modal":
        case "tab":
          setGameUrl(result.url);
          break;
      }
    } else {

    }
  };

  const closeGameModal = () => {
    selectedGameId = null;
    selectedGameType = null;
    selectedGameLauncher = null;
    selectedGameName = null;
    selectedGameImg = null;
    setGameUrl("");
    setShouldShowGameModal(false);
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
  };

  const handleProviderSelect = (provider, index = 0) => {
    setSelectedProvider(provider);

    if (provider) {
      // Open the search UI
      document.body.classList.add('hc-opened-search');
      
      // Set the search text to provider name
      setTxtSearch(provider.name || '');
      
      // Mark that provider is selected to disable search input
      setIsProviderSelected(true);

      // Clear existing search games to show loading state
      setSearchGames([]);
      
      fetchContent(
        provider,
        provider.id,
        provider.table_name,
        index,
        true
      );

      if (isMobile) {
        setMobileShowMore(true);
      }
    } else {
      // Clear search when deselecting provider
      setTxtSearch('');
      document.body.classList.remove('hc-opened-search');
      setSearchGames([]);
      
      // Enable search input again
      setIsProviderSelected(false);
      
      const firstCategory = categories[0];
      if (firstCategory) {
        fetchContent(firstCategory, firstCategory.id, firstCategory.table_name, 0, true);
      }
    }
  };

  return (
    <>
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onConfirm={handleLoginConfirm}
        />
      )}
      {shouldShowGameModal && selectedGameId !== null ? (
        <GameModal
          gameUrl={gameUrl}
          gameName={selectedGameName}
          gameImg={selectedGameImg}
          reload={launchGame}
          launchInNewTab={() => launchGame(null, null, "tab")}
          ref={refGameModal}
          onClose={closeGameModal}
          isMobile={isMobile}
          categories={categories}
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
          tags={tags}
          getPage={getPage}
        />
      ) : (
        <>
          <>
            <Slideshow />

            {isSingleCategoryView ? (
              <div className="casino">
                <div className="container">
                  <div className="float-casino-wrapper">
                    <div className="float-casino-search-body">
                      <div className="jel-games-module">
                        <div className="jel-games-module-ex">
                          <div className="jel-games-module-title">
                            <div className="jel-games-module-title-icon color-04">
                              <i className="fa-regular fa-snowflake"></i>
                            </div>
                            <div className="jel-games-module-title-text">{activeCategory?.name}</div>
                          </div>
                        </div>
                      </div>
                      <div className="float-casino-search-body-ex">
                        {games.map((game) => (
                          <GameCard
                            key={game.id}
                            id={game.id}
                            title={game.name}
                            text={isLogin ? "Jugar" : "Ingresar"}
                            imageSrc={
                              game.image_local !== null
                                ? contextData.cdnUrl + game.image_local
                                : game.image_url
                            }
                            onGameClick={() =>
                              isLogin ? launchGame(game, "slot", "modal") : handleLoginClick()
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {firstFiveCategoriesGames &&
                  firstFiveCategoriesGames.map((entry, catIndex) => {
                    if (!entry || !entry.games) return null;

                    const categoryKey = entry.category?.id || `cat-${catIndex}`;
                    if (entry.games.length === 0) return null;

                    return (
                      <div key={categoryKey}>
                        <HotGameSlideshow
                          games={entry.games.slice(0, 30)}
                          name={entry.category.name}
                          title={entry.category.name}
                          onGameClick={(game) => {
                            if (isLogin) {
                              launchGame(game, "slot", "modal");
                            } else {
                              handleLoginClick();
                            }
                          }}
                        />
                      </div>
                    );
                  })
                }
              </>
            )}
          </>

          {/* <div className="my-4">
            {(isSingleCategoryView || selectedProvider) && !isLoadingGames && (
              <div className="text-center">
                <a className="btn btn-theme btn-h-custom" onClick={loadMoreGames}>
                  Mostrar todo
                </a>
              </div>
            )}
          </div> */}

          <ProviderContainer
            categories={categories}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            onProviderSelect={handleProviderSelect}
          />

          <Footer />
        </>
      )}
    </>
  );
};

export default Casino;