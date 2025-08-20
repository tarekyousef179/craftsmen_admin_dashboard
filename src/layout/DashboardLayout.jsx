import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import HandymanIcon from "@mui/icons-material/Handyman";
import AssignmentIcon from "@mui/icons-material/Assignment";
import StarIcon from "@mui/icons-material/Star";
import CssBaseline from "@mui/material/CssBaseline";
import Tooltip from "@mui/material/Tooltip";
import TranslateIcon from "@mui/icons-material/Translate";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/themeContext.jsx";
import UserSection from "../components/UserSection";
const drawerWidth = 240;

export default function DashboardLayout() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang) {
      i18n.changeLanguage(savedLang);
      document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("language", newLang);
  };

  const sidebarItems = [
    {
      key: "dashboard",
      icon: <DashboardIcon color="inherit" />,
      path: "/dashboard",
    },
    { key: "users", icon: <PeopleIcon color="inherit" />, path: "/users" },
    {
      key: "craftsmen",
      icon: <HandymanIcon color="inherit" />,
      path: "/craftsmen",
    },
    {
      key: "requests",
      icon: <AssignmentIcon color="inherit" />,
      path: "/orders",
    },
    { key: "services", icon: <StarIcon color="inherit" />, path: "/services" },
    // { key: "settings", icon: <SettingsIcon color="inherit" /> },
  ];

  const currentPath = window.location.pathname;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${open ? drawerWidth : 64}px)`,
          ...(i18n.language === "ar"
            ? { mr: `${open ? drawerWidth : 64}px` }
            : { ml: `${open ? drawerWidth : 64}px` }),
          zIndex: 900,
          backgroundColor: "var(--color-card)",
          color: "var(--color-card-foreground)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderBottom: "1px solid var(--color-border)",
          transition: "all 0.3s ease",
        }}
        className="transition-all duration-300"
      >
        <Toolbar className="flex justify-between">
          <div
            className={`flex items-center gap-3 ${
              i18n.language === "ar" ? "flex-row-reverse" : ""
            }`}
          >
            {!open && (
              <Tooltip
                title={t("sidebar.open_menu")}
                placement={i18n.language === "ar" ? "left" : "right"}
              >
                <IconButton
                  onClick={() => setOpen(true)}
                  sx={{
                    color: "var(--color-card-foreground)",
                    backgroundColor: "var(--color-accent)",
                    "&:hover": {
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-primary-foreground)",
                    },
                  }}
                  className="transition-all duration-200"
                >
                  <MenuIcon color="inherit" />
                </IconButton>
              </Tooltip>
            )}
            <Typography
              variant="h5"
              noWrap
              sx={{
                fontWeight: "bold",
                background:
                  "linear-gradient(45deg, var(--color-primary), var(--color-accent))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {t("sidebar.dashboard")}
            </Typography>
          </div>

          <div className="flex items-center gap-3">
            <Tooltip
              title={
                darkMode ? t("sidebar.light_mode") : t("sidebar.dark_mode")
              }
            >
              <IconButton
                onClick={toggleDarkMode}
                sx={{
                  color: "var(--color-card-foreground)",
                  backgroundColor: "var(--color-accent)",
                  "&:hover": {
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-primary-foreground)",
                  },
                }}
                className="transition-all duration-200"
              >
                {darkMode ? (
                  <Brightness7Icon color="inherit" />
                ) : (
                  <Brightness4Icon color="inherit" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title={t("sidebar.change_language")}>
              <IconButton
                onClick={toggleLanguage}
                sx={{
                  color: "var(--color-card-foreground)",
                  backgroundColor: "var(--color-accent)",
                  "&:hover": {
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-primary-foreground)",
                  },
                }}
                className="transition-all duration-200"
              >
                <TranslateIcon color="inherit" />
              </IconButton>
            </Tooltip>
          </div>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        anchor={i18n.language === "ar" ? "right" : "left"}
        open={open}
        sx={{
          width: open ? drawerWidth : 64,
          flexShrink: 0,
          whiteSpace: "nowrap",
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : 64,
            transition: "width 0.3s ease",
            backgroundColor: "var(--color-background)",
            color: "var(--color-foreground)",
            borderRight: "1px solid var(--color-border)",
            overflowX: "hidden",
            zIndex: 900,
            boxShadow: "0 0 12px rgba(0,0,0,0.1)",
          },
        }}
      >
        <div className="flex items-center justify-between h-16 px-3 border-b border-[var(--color-border)]">
          {open && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                background:
                  "linear-gradient(45deg, var(--color-primary), var(--color-accent))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t("sidebar.menu")}
            </Typography>
          )}
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              color: "var(--color-foreground)",
              backgroundColor: "var(--color-accent)",
              "&:hover": {
                backgroundColor: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
              },
            }}
            className="transition-all duration-200"
          >
            {i18n.language === "ar" ? (
              <ChevronRightIcon color="inherit" />
            ) : (
              <ChevronLeftIcon color="inherit" />
            )}
          </IconButton>
        </div>
        <Divider sx={{ borderColor: "var(--color-border)" }} />
        <List>
          {sidebarItems.map((item) => {
            const isActive = item.path && currentPath.startsWith(item.path);
            return (
              <ListItem
                key={item.key}
                disablePadding
                sx={{ display: "block" }}
                onClick={() => navigate(item.path)}
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    flexDirection:
                      i18n.language === "ar" ? "row-reverse" : "row",
                    textAlign: i18n.language === "ar" ? "right" : "left",
                    background: isActive
                      ? "linear-gradient(45deg, var(--color-primary), var(--color-primary-400))"
                      : "var(--color-accent)",
                    color: isActive
                      ? "var(--color-primary-foreground)"
                      : "var(--color-accent-foreground)",
                    fontWeight: isActive ? 700 : 500,
                    borderRadius: "0.75rem",
                    margin: "0.5rem 0.75rem",
                    transition: "all 0.3s ease",
                    boxShadow: isActive ? "0 4px 8px rgba(0,0,0,0.1)" : "none",
                    "&:hover": {
                      background: isActive
                        ? "linear-gradient(45deg, var(--color-primary), var(--color-primary-400))"
                        : "var(--color-primary-100)",
                      color: isActive
                        ? "var(--color-primary-foreground)"
                        : "var(--color-primary-900)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: i18n.language === "ar" ? 0 : open ? 2 : "auto",
                      ml: i18n.language === "ar" ? (open ? 2 : "auto") : 0,
                      justifyContent: "center",
                      color: isActive
                        ? "var(--color-primary-foreground)"
                        : "var(--color-accent-foreground)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Badge
                      color="primary"
                      variant="dot"
                      invisible={!isActive}
                      sx={{
                        "& .MuiBadge-badge": {
                          backgroundColor: "var(--color-primary-foreground)",
                        },
                      }}
                    >
                      {item.icon}
                    </Badge>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <span
                        style={{
                          fontWeight: isActive ? 700 : 500,
                          fontSize: "1.2rem",
                        }}
                      >
                        {t(`sidebar.${item.key}`)}
                      </span>
                    }
                    sx={{
                      opacity: open ? 1 : 0,
                      transition: "opacity 0.3s ease",
                      textAlign: i18n.language === "ar" ? "right" : "left",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <UserSection open={open} />
      </Drawer>

      <Box
        component="main"
        className="transition-colors duration-300 p-6 min-h-screen w-full"
        sx={{
          backgroundColor: "var(--color-background)",
          color: "var(--color-foreground)",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
