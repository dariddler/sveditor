import React, { Component } from 'react';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';

const SortableItem = SortableElement(({ value }) => {
    return (
        <li>
            <div className={'sortItem'}>
                <div className={'name'}>{value.name[0]}</div>
                <div className={'date'}>{value.tmpHolder && value.tmpHolder.toISOString()}</div>
            </div>
        </li>
    );
});

const SortableList = SortableContainer(({ items }) => {
    return (
        <ul className={'playerList'}>
            {items.map((value, index) => {
                return (
                    <SortableItem key={`item-${index}`} index={index} value={value} />
                );
            }
            )}
        </ul>
    );
});

class Players extends Component {

    componentDidMount() {
        this.setState({ players: this.props.players });
    }

    componentWillReceiveProps(newProps) {
        console.log(newProps);
        this.setState(newProps);
    }

    onSortEnd = ({ oldIndex, newIndex }) => {
        this.setState({
            players: arrayMove(this.state.players, oldIndex, newIndex),
        });

        if (this.props.onSort) {
            this.props.onSort(this.state.players);
        }
    };    

    render() {
        if (!this.state || !this.state.players) {
            return null;
        }
        return <SortableList items={this.state.players} onSortEnd={this.onSortEnd} />;
    }
}

export default Players;