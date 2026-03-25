/** @jsx h */
import { h, Component } from 'preact';
import classnames from 'classnames';

// Dropdown button component for properties panel
// Code modified from https://github.com/bpmn-io/properties-panel/blob/main/src/components/DropdownButton.js
// The original template was not customizable enough so it was modified to fit the project
// Using hooks broke the code so it was converted to a class component 

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
  // Toggle dropdown menu
  onDropdownToggle(event) {
    if (this.menuRef && this.menuRef.contains(event.target)) {
      return;
    }

    event.stopPropagation();
    this.setState(({ open }) => ({ open: !open }));
  }

  // Handle menu item click
  onActionClick(event, item) {
    event.stopPropagation();
    this.close();

    // Update display immediately
    if (item && item.entry) {
      this.setState({ selected: item.entry });
    }

    if (item && typeof item.action === 'function') {
      item.action();
    }
  }
  // Close dropdown menu on outside click
  componentDidMount() {
    document.addEventListener('click', this.globalClickListener, { capture: true });
  }
  // Update selected value if props change
  componentDidUpdate(prevProps) {
    if (prevProps.selectedValue !== this.props.selectedValue) {
      this.setState({ selected: this.props.selectedValue || '' });
    }
  }
  // Clean up event listener on unmount
  componentWillUnmount() {
    document.removeEventListener('click', this.globalClickListener, { capture: true });
  }
  // Listen for clicks outside the dropdown to close it
  globalClickListener = (event) => {
    if ([this.dropdownRef].some(el => el && el.contains(event.target))) {
      return;
    }

    this.close();
  };
  // Render the dropdown button and menu
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
// Render individual menu items, handling separators and actionable items
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