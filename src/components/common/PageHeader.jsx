import React from "react";
import { Box, Typography, Button, Breadcrumbs, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const PageHeader = ({
  title,
  subtitle,
  buttonText,
  buttonIcon: ButtonIcon,
  buttonAction,
  breadcrumbs = [],
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={index} color="text.primary">
                {crumb.text}
              </Typography>
            ) : (
              <Link
                key={index}
                component={RouterLink}
                underline="hover"
                color="inherit"
                to={crumb.link}
              >
                {crumb.text}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {buttonText && buttonAction && (
          <Button
            variant="contained"
            color="primary"
            startIcon={ButtonIcon && <ButtonIcon />}
            onClick={buttonAction}
          >
            {buttonText}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
