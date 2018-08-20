import React, { Component } from 'react';
import emojiConverter from '../emojiConverter';
import PropTypes from 'prop-types';
import EmojiPicker from 'emoji-picker-react';
import './style.scss';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import classNames from 'classnames';
import InputAdornment from '@material-ui/core/InputAdornment';
import Popover from '@material-ui/core/Popover';

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
    menu: {
        width: 200,
    },
});

class EmojiField extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value || '',
            initialMount: false,
            pickerOpen: props.pickerOpen || false,
            anchorEl: null,
        };

        this.emojiConverter = emojiConverter(props.config);

        this.onChange = this.onChange.bind(this);
        this.onTriggerClick = this.onTriggerClick.bind(this);
        this.onEmojiClick = this.onEmojiClick.bind(this);
        this.isAnOutsideClick = this.isAnOutsideClick.bind(this);
        this.onPickerkeypress = this.onPickerkeypress.bind(this);
        this.closePicker = this.closePicker.bind(this);
        this.openPicker = this.openPicker.bind(this);
    }

    componentDidUpdate() {
        if (this.state.pickerOpen) {
            setTimeout(() => {
                window.addEventListener('click', this.isAnOutsideClick);
                window.addEventListener('keyup', this.onPickerkeypress);
            });
        }
    }

    unifyValue(value) {
        this.unifiedValue = this.emojiConverter.replace_colons(value);
        return this.unifiedValue;
    }

    getUnicode() {
        const allowNative = this.emojiConverter.allow_native;
        this.emojiConverter.allow_native = true;
        const unicodeValue = this.emojiConverter.replace_colons(this.state.value);
        this.emojiConverter.allow_native = allowNative;
        return unicodeValue;
    }

    getImages() {
        const allowNative = this.emojiConverter.allow_native;
        this.emojiConverter.allow_native = false;
        const unicodeValue = this.emojiConverter.replace_colons(this.state.value);
        this.emojiConverter.allow_native = allowNative;
        return unicodeValue;
    }

    onChange(e) {
        const value = e ? e.target.value : this.state.value;

        this.setState({ value }, () => {
            if (typeof this.props.onChange === 'function') {
                this.props.onChange(e, value);
            }
        });
    }

    isAnOutsideClick(e) {
        e.preventDefault();
        const shouldClose = !this._picker || !this._picker._picker.contains(e.target);

        if (shouldClose) {
            this.closePicker();
        }
    }

    onPickerkeypress(e) {
        if (e.keyCode === 27 || e.which === 27 || e.key === 'Escape' || e.code === 'Escape') {
            this.closePicker();
        }
    }

    closePicker() {
        this.setState({
            pickerOpen: false,
            anchorEl: null,
        }, () => {
            window.removeEventListener('click', this.isAnOutsideClick);
            window.removeEventListener('keyup', this.onPickerkeypress);
        });
    }

    openPicker(event) {
        this.setState({
            pickerOpen: true,
            anchorEl: event.currentTarget,
        }, () => {
            window.addEventListener('click', this.isAnOutsideClick);
            window.addEventListener('keyup', this.onPickerkeypress);
        });
    }

    onTriggerClick(e) {
        e.preventDefault();
        e.stopPropagation();

        this.state.pickerOpen ? this.closePicker() : this.openPicker(e);
    }

    onEmojiClick(code, emoji) {
        const value = this.state.value,
            selection = this._field.selectionStart,
            shortcode = `:${emoji.name}:`,
            v1 = value.slice(0, selection),
            v2 = value.slice(selection),
            newValue = `${v1}${shortcode}${v2}`;

        this.setState({
            value: newValue
        }, () => {
            this._field.selectionStart = selection + shortcode.length;
            this.onChange(null);
        });

        if (this.props.autoClose) {
            this.closePicker();
        }
    }

    render() {
        const { autoClose, onChange, config, fieldType, classes, ...rest } = this.props;

        const isOpenClass = this.state.pickerOpen ? 'shown' : 'hidden',
            className = `emoji-text-field picker-${isOpenClass} emoji-${fieldType}`,
            { value, pickerOpen, anchorEl } = this.state,
            ref = (_field) => this._field = _field;

        return (
            <div className={className}>
                <FormControl className={classNames(classes.margin, classes.textField)}>
                    <InputLabel htmlFor="adornment-password">Password</InputLabel>
                    <Input
                        id="adornment-password"
                        value={value}
                        onChange={this.onChange}
                        ref={ref}
                        endAdornment={
                            <InputAdornment position="end">
                                <a href="#!" className="emoji-trigger" onClick={this.onTriggerClick}></a>
                            </InputAdornment>
                        }
                        {...rest}
                    />
                </FormControl>
                {
                    <Popover
                        id="simple-popper"
                        open={pickerOpen}
                        anchorEl={anchorEl}
                        onClose={this.closePicker}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                    >
                        <EmojiPicker onEmojiClick={this.onEmojiClick} ref={(picker) => this._picker = picker} />
                    </Popover>
                }
            </div>
        );
    }
}

EmojiField.propTypes = {
    value: PropTypes.string,
    pickerOpen: PropTypes.bool,
    autoClose: PropTypes.bool,
    onChange: PropTypes.func,
    config: PropTypes.object,
    fieldType: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EmojiField);