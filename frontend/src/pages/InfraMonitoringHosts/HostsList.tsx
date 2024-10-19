import { Table, Typography } from 'antd';
import { HostListPayload } from 'api/infraMonitoring/getHostLists';
import { HostMetricsLoading } from 'container/HostMetricsLoading/HostMetricsLoading';
import NoLogs from 'container/NoLogs/NoLogs';
import { useGetHostList } from 'hooks/infraMonitoring/useGetHostList';
import { useMemo, useState } from 'react';
import { DataSource } from 'types/common/queryBuilder';

import HostsListControls from './HostsListControls';
import {
	formatDataForTable,
	getHostListsQuery,
	getHostsListColumns,
} from './utils';

interface HostsListProps {
	isFilterApplied: boolean;
}

function HostsList({ isFilterApplied }: HostsListProps): JSX.Element {
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;

	const query = useMemo(() => {
		const baseQuery = getHostListsQuery();
		return {
			...baseQuery,
			limit: pageSize,
			offset: (currentPage - 1) * pageSize,
		};
	}, [currentPage]);

	const { data, isFetching, isLoading, isError } = useGetHostList(
		query as HostListPayload,
		{
			queryKey: ['hostList', query],
			enabled: !!query,
		},
	);

	const hostMetricsData = useMemo(() => data?.payload?.data?.records || [], [
		data,
	]);
	const totalCount = data?.payload?.data?.total || 0;

	const formattedHostMetricsData = useMemo(
		() => formatDataForTable(hostMetricsData),
		[hostMetricsData],
	);

	const columns = useMemo(() => getHostsListColumns(), []);

	const isDataPresent =
		!isLoading && !isFetching && !isError && hostMetricsData.length === 0;

	const handleTableChange = (pagination: any): void => {
		if (pagination.current) {
			setCurrentPage(pagination.current);
		}
	};

	return (
		<div>
			<HostsListControls />
			{isError && <Typography>{data?.error || 'Something went wrong'}</Typography>}

			{isLoading && <HostMetricsLoading />}

			{isDataPresent && !isFilterApplied && (
				<NoLogs dataSource={DataSource.METRICS} />
			)}

			{isDataPresent && isFilterApplied && (
				<div>No hosts match the applied filters.</div>
			)}

			{!isError && formattedHostMetricsData.length > 0 && (
				<Table
					dataSource={formattedHostMetricsData}
					columns={columns}
					pagination={{
						current: currentPage,
						pageSize,
						total: totalCount,
						showSizeChanger: false,
						hideOnSinglePage: true,
					}}
					scroll={{ x: true }}
					loading={isFetching}
					tableLayout="fixed"
					rowKey={(record): string => record.hostName}
					onChange={handleTableChange}
				/>
			)}
		</div>
	);
}

export default HostsList;
