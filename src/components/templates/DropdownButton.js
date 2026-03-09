/** @jsx h */
import { h, Component } from 'preact';
import classnames from 'classnames';

// no hooks used; global click logic handled via lifecycle methods

/**
 *
 * @param {object} props
 * @param {string} [props.class]
 * @param {import('preact').Component[]} [props.menuItems]
 * @returns
 */
export class DropdownButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      selected: props.selectedValue || props.children || ''
    };

    this.dropdownRef = null;
    this.menuRef = null;

    this.onDropdownToggle = this.onDropdownToggle.bind(this);
    this.onActionClick = this.onActionClick.bind(this);
    this.close = this.close.bind(this);
  }

  close() {
    this.setState({ open: false });
  }

  onDropdownToggle(event) {
    if (this.menuRef && this.menuRef.contains(event.target)) {
      return;
    }

    event.stopPropagation();
    this.setState(({ open }) => ({ open: !open }));
  }

  onActionClick(event, item) {
    event.stopPropagation();
    this.close();

    // update display immediately
    if (item && item.entry) {
      this.setState({ selected: item.entry });
    }

    if (item && typeof item.action === 'function') {
      item.action();
    }
  }

  componentDidMount() {
    document.addEventListener('click', this.globalClickListener, { capture: true });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedValue !== this.props.selectedValue) {
      this.setState({ selected: this.props.selectedValue || '' });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.globalClickListener, { capture: true });
  }

  globalClickListener = (event) => {
    if ([this.dropdownRef].some(el => el && el.contains(event.target))) {
      return;
    }

    this.close();
  };

  render() {
    const {
      class: className,
      children,
      selectedValue,
      menuItems = []
    } = this.props;

    const { open } = this.state;

    return (
      <div
        class={ classnames('bio-properties-panel-dropdown-button', { open }, className) }
        onClick={ this.onDropdownToggle }
        ref={el => (this.dropdownRef = el)}
      >
        { this.state.selected || selectedValue || children }
        <div class="bio-properties-panel-dropdown-button__menu" ref={el => (this.menuRef = el)}>
          { menuItems.map((item, index) => (
            <MenuItem onClick={ e => this.onActionClick(e, item) } item={ item } key={ index } />
          )) }
        </div>
      </div>
    );
  }
}

function MenuItem({ item, onClick }) {
  if (item.separator) {
    return <div class="bio-properties-panel-dropdown-button__menu-item bio-properties-panel-dropdown-button__menu-item--separator" />;
  }

  if (item.action) {
    return (<button
      type="button"
      class="bio-properties-panel-dropdown-button__menu-item bio-properties-panel-dropdown-button__menu-item--actionable"
      onClick={ onClick }
    >
      {item.entry}
    </button>);
  }

  return <div
    class="bio-properties-panel-dropdown-button__menu-item"
  >
    {item.entry}
  </div>;
}