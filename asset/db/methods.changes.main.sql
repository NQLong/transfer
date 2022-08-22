CREATE OR REPLACE FUNCTION TC_HOC_PHI_GET_ALL_MSSV(iMssv IN STRING, hocPhiDetailAll OUT SYS_REFCURSOR) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN hocPhiDetailAll FOR
        SELECT HPD.MSSV     AS "mssv",
               HPD.LOAI_PHI AS "loaiPhi",

               HPD.HOC_KY   AS "hocKy",
               HPD.NAM_HOC  AS "namHoc",
               HPD.SO_TIEN  AS "soTien",
               LP.TEN       AS "tenLoaiPhi"

        FROM TC_HOC_PHI_DETAIL HPD
                 LEFT JOIN FW_STUDENT ST ON HPD.MSSV = ST.MSSV
                 LEFT JOIN TC_LOAI_PHI LP ON LP.ID = HPD.LOAI_PHI
                 LEFT JOIN DM_DON_VI DV ON DV.MA = ST.KHOA

        WHERE HPD.MSSV = iMssv
        ORDER BY HPD.NAM_HOC DESC, HPD.HOC_KY DESC;

    OPEN my_cursor FOR
        SELECT HP.MSSV    AS "mssv",
               HP.NAM_HOC as "namHoc",
               HP.HOC_KY  as "hocKy",
               hp.HOC_PHI as "hocPhi",
               hp.CONG_NO as "congNo",
               THPTI.ID   AS "idHoaDon"
        FROM TC_HOC_PHI HP
                 LEFT JOIN TC_HOC_PHI_TRANSACTION_INVOICE THPTI
                           on HP.MSSV = THPTI.MSSV and THPTI.NAM_HOC = HP.NAM_HOC and THPTI.HOC_KY = HP.HOC_KY and THPTI.LY_DO_HUY is null
        WHERE HP.MSSV = iMssv
        ORDER BY HP.NAM_HOC DESC, HP.HOC_KY DESC;

    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_GET_INVOICE_LIST(tuNgay in Number, denNgay in Number, hocKy in Number, namHoc in Number) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;

BEGIN
    Open my_cursor for
        SELECT HP.MSSV         AS                           "mssv",
               HP.NAM_HOC      AS                           "namHoc",
               HP.HOC_KY       AS                           "hocKy",
               HP.CONG_NO      AS                           "congNo",
               HP.HOC_PHI      AS                           "hocPhi",
               FS.HO           as                           "ho",
               FS.TEN          AS                           "ten",
               FS.EMAIL_TRUONG AS                           "emailTruong",
               FS.MA_NGANH     AS                           "maNganh",
               NDT.TEN_NGANH   AS                           "tenNganh",
               DV.TEN          AS                           "tenKhoa",
               LHDT.TEN        AS                           "tenLoaiHinhDaoTao",

               (
                   SELECT LISTAGG(LP.TEN || '||' || TO_CHAR(dt.SO_TIEN), '|||') WITHIN GROUP (order by dt.LOAI_PHI)
                   from TC_HOC_PHI_DETAIL dt LEFT JOIN TC_LOAI_PHI LP
                   on LP.ID = dt.LOAI_PHI
                   where dt.MSSV = hp.MSSV and dt.HOC_KY = hp.HOC_KY and dt.NAM_HOC = hp.NAM_HOC
               )               AS                           "details",
               ROW_NUMBER() OVER (ORDER BY THPT.TRANS_DATE) R
        FROM TC_HOC_PHI HP
                 LEFT JOIN FW_STUDENT FS
                           on HP.MSSV = FS.MSSV
                 LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                 LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                 LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                 LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
                 LEFT JOIN TC_HOC_PHI_TRANSACTION_INVOICE HPI
                           on HPI.MSSV = HP.MSSV and HPI.NAM_HOC = HP.NAM_HOC and HP.HOC_KY = HPI.HOC_KY and HPI.LY_DO_HUY is null
                 LEFT JOIN TC_HOC_PHI_TRANSACTION THPT on HP.HOC_KY = THPT.HOC_KY
            AND HP.NAM_HOC = THPT.NAM_HOC
            AND HP.MSSV = THPT.CUSTOMER_ID
            AND THPT.TRANS_DATE = (SELECT MAX(TRANS_DATE)
                                   FROM TC_HOC_PHI_TRANSACTION TRANS
                                   WHERE HP.HOC_KY = TRANS.HOC_KY
                                     AND HP.NAM_HOC = TRANS.NAM_HOC
                                     AND HP.MSSV = TRANS.CUSTOMER_ID)
        WHERE HPI.ID is null
          and THPT.TRANS_DATE is not null
          and HP.NAM_HOC = namHoc
          AND HP.HOC_KY = hocKy
          and HP.CONG_NO = 0
          and ((tuNgay is null and denNgay is null) or
               (
                           IS_NUMERIC(THPT.TRANS_DATE) = 1
                       and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                       and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
                   ))
        ORDER BY R;
    RETURN my_cursor;
END ;

/
--EndMethod--