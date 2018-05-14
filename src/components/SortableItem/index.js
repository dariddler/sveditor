import React from 'react';
import { sortable } from 'react-sortable';

class Item extends React.Component {
    render() {
        return (
            <li {...this.props}>
                {this.props.children}
            </li>
        )
    }
}
var SortableItem = sortable(Item);
export default SortableItem;