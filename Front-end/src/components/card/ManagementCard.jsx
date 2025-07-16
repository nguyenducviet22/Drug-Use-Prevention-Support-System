import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { PlusCircle } from 'lucide-react'; // Import PlusCircle icon

const ManagementCard = ({
    title,
    icon: IconComponent,
    iconBgClass,
    activeTab,
    setActiveTab,
    activeSubTab,
    setActiveSubTab,
    data,
    counts,
    dataType,
    onApprove,
    onView,
    onAdd // Add the new onAdd prop
}) => {

    const TabButton = ({ active, onClick, children, count }) => (
        <Button
            variant={active ? 'primary' : 'outline-secondary'}
            size="sm"
            onClick={onClick}
            className="me-2 d-flex align-items-center rounded-pill px-3"
            style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                border: active ? 'none' : '1px solid #dee2e6'
            }}
        >
            <span className="me-2">{children}</span>
            <Badge
                bg={active ? 'light' : 'secondary'}
                text={active ? 'dark' : 'light'}
                className="rounded-pill"
                style={{ fontSize: '0.75rem' }}>
                {/* Luôn hiển thị count, kể cả là 0 */}
                {count !== undefined ? count : '0'}
            </Badge>
        </Button>
    );

    const SimpleCard = ({ item, isPending }) => {
        const name = item.courseName || item.blogName || item.eventName || 'No Title';
        const submittedDate = item.updatedAt || 'recently';
        const id = item.courseID || item.blogID || item.eventID;
        const author = item.member?.username || 'Unknown Author';
        const type = dataType;

        return (
            <Card className="mb-2 shadow-sm border-0">
                <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1 me-3">
                            <Card.Title className="h6 mb-1">{name}</Card.Title>
                            <Card.Text className="text-muted small mb-0">
                                <span className="fw-medium">By {author}</span>
                                <span className="mx-2">•</span>
                                <span>{submittedDate}</span>
                            </Card.Text>
                        </div>
                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                            {item.blogID && item.blogStatus === 'PENDING' && item.member.role !== 'STAFF' && (
                                <Button
                                    size="sm"
                                    variant="outline-success"
                                    className="fw-bold"
                                    onClick={() => onApprove && onApprove(id, title.toLowerCase().slice(0, -1))} // Pass ID and type
                                >
                                    Approve
                                </Button>
                            )}
                            <Button variant="outline-primary" size="sm" onClick={() => onView(id, type)}>
                                {isPending ? 'Review' : 'View'}
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        )
    };

    // --- Logic để lấy danh sách cần render và hiển thị thông báo khi rỗng ---
    const itemsToRender = dataType === 'blog'
        ? data?.[activeTab]?.[activeSubTab] || []
        : data?.[activeTab] || [];

    const renderContent = () => {
        if (itemsToRender.length === 0) {
            return <div className="text-center text-muted mt-4">No items to display.</div>;
        }

        return itemsToRender.map(item => (
            <SimpleCard
                key={item.id || item.courseID || item.blogID} // Sử dụng key duy nhất
                item={item}
                isPending={activeTab === 'pending' || activeSubTab === 'pending'}
            />
        ));
    };

    return (
        <Card className="h-100 custom-shadow">
            <Card.Body className="d-flex flex-column">
                <div className="d-flex align-items-center mb-4">
                    <div
                        className={`d-flex align-items-center justify-content-center me-3 ${iconBgClass} rounded`}
                        style={{ width: '40px', height: '40px' }}
                    >
                        <IconComponent size={20} />
                    </div>
                    <Card.Title className="mb-0 h5">{title}</Card.Title>
                    {onAdd && ( // Render Add button if onAdd prop is provided
                        <Button variant="outline-success" size="sm" onClick={onAdd} className="ms-auto">
                            <PlusCircle size={16} className="me-1" /> Add
                        </Button>
                    )}
                </div>

                {/* --- Phần Tabs --- */}
                {dataType === 'blog' ? (
                    <div className="mb-3">
                        {/* Main Tabs: Me / Others */}
                        <div className="d-flex align-items-center mb-2">
                            <TabButton
                                active={activeTab === 'me'}
                                onClick={() => setActiveTab('me')}
                                count={counts.me.pending + counts.me.approved}
                            >
                                Me
                            </TabButton>
                            <TabButton
                                active={activeTab === 'others'}
                                onClick={() => setActiveTab('others')}
                                count={counts.others.pending + counts.others.approved}
                            >
                                Others
                            </TabButton>
                        </div>

                        {/* Sub Tabs: Pending / Approved */}
                        <div className="d-flex align-items-center border-top pt-2 mt-2">
                            <TabButton
                                active={activeSubTab === 'pending'}
                                onClick={() => setActiveSubTab('pending')}
                                count={counts[activeTab]?.pending}
                            >
                                Pending
                            </TabButton>
                            <TabButton
                                active={activeSubTab === 'approved'}
                                onClick={() => setActiveSubTab('approved')}
                                count={counts[activeTab]?.approved}
                            >
                                Approved
                            </TabButton>
                        </div>
                    </div>
                ) : (
                    <div className="mb-4 d-flex">
                        <TabButton
                            active={activeTab === 'pending'}
                            onClick={() => setActiveTab('pending')}
                            count={counts?.pending}
                        >
                            Pending
                        </TabButton>
                        <TabButton
                            active={activeTab === 'approved'}
                            onClick={() => setActiveTab('approved')}
                            count={counts?.approved}
                        >
                            Approved
                        </TabButton>
                    </div>
                )}

                {/* --- Phần nội dung (có thể cuộn) --- */}
                <div className="flex-grow-1" style={{ overflowY: 'auto', minHeight: '250px' }}>
                    {renderContent()}
                </div>
            </Card.Body>
        </Card>
    );
};

export default ManagementCard;