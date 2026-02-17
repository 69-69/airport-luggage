import {
    MenuItem, Button,
    Menu, Autocomplete, TextField
} from "@mui/material";
import React from "react";

interface DropdownItem {
    label: string;
    onClick: () => void;
}

interface DropdownMenuProps {
    items: string[]; // list of menu item labels
    onItemClick?: (label: string) => void; // optional callback
    buttonLabel?: string; // button text, default: "Open Menu"
}

/*<Dropdown items={[
    {
        label: "Edit",
        onClick: () => {
            console.log("Edit clicked");
        },
    },
    {
        label: "Delete",
        onClick: () => {
            console.log("Delete clicked");
        },
    },
]} />*/
export const Dropdown = ({items}: { items: DropdownItem[] }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    return (
        <>
            <Button onClick={(e) => setAnchorEl(e.currentTarget)}>Menu</Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                {items.map((item) => (
                    <MenuItem
                        key={item.label}
                        onClick={() => {
                            item.onClick();
                            setAnchorEl(null);
                        }}
                    >
                        {item.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

/*<DropdownMenu
      items={["Profile", "Settings", "Logout"]}
      onItemClick={handleMenuClick}
      buttonLabel="User Menu"
    />*/
export const DropdownMenu = ({
                                 items,
                                 onItemClick,
                                 buttonLabel = "Open Menu",
                             }: DropdownMenuProps) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (label?: string) => {
        setAnchorEl(null);
        if (label && onItemClick) {
            onItemClick(label);
        }
    };

    return (
        <>
            <Button
                id="basic-button"
                variant="contained"
                onClick={handleClick}
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
            >
                {buttonLabel}
            </Button>

            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={() => handleClose()}
                slotProps={{
                    list: {
                        "aria-labelledby": "basic-button",
                    },
                }}
            >
                {items.map((label) => (
                    <MenuItem key={label} onClick={() => handleClose(label)}>
                        {label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export const AutocompleteDropdown = (
    {label, data, onChange, value, disabled, helperText}: {
        label: string;
        disabled?: boolean;
        data: string[];
        value: string;
        helperText?: string;
        onChange: (value: string) => void;
    }) => {
    return (
        <Autocomplete
            disabled={disabled}
            freeSolo
            options={[
                ...new Set(
                    (Array.isArray(data) ? data : [])
                        .map((a) => a)
                        .filter(Boolean) // optional: removes empty/null values
                )
            ]}
            value={value}  // Bind value to the state from the parent
            onChange={(event, newValue) => onChange(newValue ?? '')}
            onInputChange={(event, newInputValue) => onChange(newInputValue)}
            renderInput={(params) => (
                <TextField {...params} label={label} helperText={helperText} size="small"/>
            )}
        />
    );
};