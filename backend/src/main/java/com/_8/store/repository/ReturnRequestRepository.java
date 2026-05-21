package com._8.store.repository;

import com._8.store.entity.ReturnRequest;
import com._8.store.entity.ReturnRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {

    List<ReturnRequest> findAllByOrderByRequestedAtDesc();

    List<ReturnRequest> findAllByStatusOrderByRequestedAtDesc(ReturnRequestStatus status);

    List<ReturnRequest> findAllByCustomer_IdOrderByRequestedAtDesc(Long customerId);

    boolean existsByOrderItem_Id(Long orderItemId);
}
